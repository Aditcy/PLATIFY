const mongoose = require('mongoose')

const Order = require('../../models/Order')
const Product = require('../../models/Product')
const Customer = require('../../models/Customer')
const StockMovement = require('../../models/StockMovement')

const allowedPaymentMethods = [
  'cash',
  'upi',
  'card',
  'online',
  'other'
]

const allowedPaymentStatuses = [
  'pending',
  'paid',
  'failed',
  'refunded'
]

const allowedOrderStatuses = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
]

const getOrders = async (req, res) => {
  try {
    const filter = {
      tenantId: req.tenant._id
    }

    if (req.query.status) {
      if (!allowedOrderStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order status'
        })
      }

      filter.orderStatus = req.query.status
    }

    const orders = await Order.find(filter)
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    })
  } catch (error) {
    console.error('Get orders error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch orders'
    })
  }
}

const getOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      })
    }

    const order = await Order.findOne({
      _id: req.params.orderId,
      tenantId: req.tenant._id
    }).populate('customerId', 'name email phone')

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    return res.status(200).json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('Get order error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch order'
    })
  }
}

const createOrder = async (req, res) => {
  const session = await mongoose.startSession()

  try {
    const {
      customerId,
      customerName,
      customerEmail,
      items,
      discount = 0,
      tax = 0,
      shippingCost = 0,
      paymentMethod = 'other',
      paymentStatus = 'pending',
      notes = ''
    } = req.body

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'An order must contain at least one product'
      })
    }

    if (
      !Number.isFinite(Number(discount)) ||
      !Number.isFinite(Number(tax)) ||
      !Number.isFinite(Number(shippingCost)) ||
      Number(discount) < 0 ||
      Number(tax) < 0 ||
      Number(shippingCost) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Discount, tax and shipping cost must be valid non-negative numbers'
      })
    }

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      })
    }

    if (!allowedPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      })
    }

    if (customerId && !mongoose.isValidObjectId(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      })
    }

    if (!customerId && (!customerName || !customerName.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required'
      })
    }

    const tenantId = req.tenant._id
    let createdOrder

    await session.withTransaction(async () => {
      let customer = null

      if (customerId) {
        customer = await Customer.findOne({
          _id: customerId,
          tenantId,
          isActive: true
        }).session(session)

        if (!customer) {
          const error = new Error('Customer not found in this business')
          error.statusCode = 404
          throw error
        }
      }

      const preparedItems = []
      const requestedQuantities = new Map()
      let subtotal = 0

      for (const item of items) {
        if (
          !mongoose.isValidObjectId(item.productId) ||
          !Number.isInteger(Number(item.quantity)) ||
          Number(item.quantity) < 1
        ) {
          const error = new Error('Each item must have a valid product ID and positive whole-number quantity')
          error.statusCode = 400
          throw error
        }

        const quantity = Number(item.quantity)
        const productId = item.productId.toString()

        requestedQuantities.set(
          productId,
          (requestedQuantities.get(productId) || 0) + quantity
        )

        const product = await Product.findOne({
          _id: item.productId,
          tenantId,
          isActive: true
        }).session(session)

        if (!product) {
          const error = new Error('One or more products were not found in this business')
          error.statusCode = 404
          throw error
        }

        const unitPrice = product.price
        const itemSubtotal = unitPrice * quantity

        preparedItems.push({
          productId: product._id,
          productName: product.name,
          sku: product.sku,
          quantity,
          unitPrice,
          subtotal: itemSubtotal
        })

        subtotal += itemSubtotal
      }

      for (const [productId, quantity] of requestedQuantities) {
        const product = await Product.findOne({
          _id: productId,
          tenantId,
          isActive: true
        }).session(session)

        if (product.stockQuantity < quantity) {
          const error = new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, requested: ${quantity}`
          )
          error.statusCode = 400
          throw error
        }
      }

      const finalDiscount = Number(discount)
      const finalTax = Number(tax)
      const finalShipping = Number(shippingCost)
      const totalAmount = subtotal - finalDiscount + finalTax + finalShipping

      if (totalAmount < 0) {
        const error = new Error('Order total cannot be negative')
        error.statusCode = 400
        throw error
      }

      for (const [productId, quantity] of requestedQuantities) {
        const product = await Product.findOne({
          _id: productId,
          tenantId,
          isActive: true
        }).session(session)

        const previousStock = product.stockQuantity
        product.stockQuantity -= quantity

        await product.save({ session })

        await StockMovement.create([{
          tenantId,
          productId: product._id,
          type: 'stock_out',
          quantity,
          previousStock,
          newStock: product.stockQuantity,
          reason: 'Stock deducted for order',
          performedBy: req.user._id
        }], { session })
      }

      const orderNumber = `PL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`

      const orderData = {
        tenantId,
        orderNumber,
        customerId: customer?._id || null,
        customerName: customer?.name || customerName.trim(),
        customerEmail: customer?.email || (customerEmail || '').trim().toLowerCase(),
        items: preparedItems,
        subtotal,
        discount: finalDiscount,
        tax: finalTax,
        shippingCost: finalShipping,
        totalAmount,
        paymentMethod,
        paymentStatus,
        notes
      }

      const [order] = await Order.create([orderData], { session })
      createdOrder = order
    })

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: createdOrder
    })
  } catch (error) {
    console.error('Create order error:', error.message)

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Unable to create order'
    })
  } finally {
    await session.endSession()
  }
}

const updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession()

  try {
    const { orderStatus, paymentStatus } = req.body

    if (
      orderStatus !== undefined &&
      !allowedOrderStatuses.includes(orderStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      })
    }

    if (
      paymentStatus !== undefined &&
      !allowedPaymentStatuses.includes(paymentStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      })
    }

    if (orderStatus === undefined && paymentStatus === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Provide an order status or payment status'
      })
    }

    if (!mongoose.isValidObjectId(req.params.orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      })
    }

    let updatedOrder

    await session.withTransaction(async () => {
      const order = await Order.findOne({
        _id: req.params.orderId,
        tenantId: req.tenant._id
      }).session(session)

      if (!order) {
        const error = new Error('Order not found')
        error.statusCode = 404
        throw error
      }

      if (order.orderStatus === 'cancelled') {
        const error = new Error('A cancelled order cannot be updated')
        error.statusCode = 400
        throw error
      }

      if (orderStatus === 'cancelled') {
        if (!['pending', 'processing'].includes(order.orderStatus)) {
          const error = new Error('Only pending or processing orders can be cancelled')
          error.statusCode = 400
          throw error
        }

        for (const item of order.items) {
          const product = await Product.findOne({
            _id: item.productId,
            tenantId: req.tenant._id
          }).session(session)

          if (!product) {
            const error = new Error(`Product ${item.productName} could not be found while restoring stock`)
            error.statusCode = 404
            throw error
          }

          const previousStock = product.stockQuantity
          product.stockQuantity += item.quantity

          await product.save({ session })

          await StockMovement.create([{
            tenantId: req.tenant._id,
            productId: product._id,
            type: 'stock_in',
            quantity: item.quantity,
            previousStock,
            newStock: product.stockQuantity,
            reason: `Stock restored from cancelled order ${order.orderNumber}`,
            performedBy: req.user._id
          }], { session })
        }
      }

      if (orderStatus !== undefined) {
        order.orderStatus = orderStatus
      }

      if (paymentStatus !== undefined) {
        order.paymentStatus = paymentStatus
      }

      await order.save({ session })
      updatedOrder = order
    })

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder
    })
  } catch (error) {
    console.error('Update order error:', error.message)

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Unable to update order'
    })

  } finally {
    await session.endSession()
  }
}

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
}
