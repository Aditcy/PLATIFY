
const mongoose = require('mongoose')
const Product = require('../../models/Product')
const Customer = require('../../models/Customer')
const Order = require('../../models/Order')

const getOverview = async (req, res) => {
  try {
    const tenantId = req.tenant._id

    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      lowStockProducts,
      revenueResult,
      orderStatuses
    ] = await Promise.all([
      Product.countDocuments({ tenantId, isActive: true }),

      Customer.countDocuments({ tenantId, isActive: true }),

      Order.countDocuments({ tenantId }),

      Product.countDocuments({
        tenantId,
        isActive: true,
        $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }
      }),

      Order.aggregate([
        {
          $match: {
            tenantId,
            paymentStatus: 'paid',
            orderStatus: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' }
          }
        }
      ]),

      Order.aggregate([
        { $match: { tenantId } },
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 }
          }
        }
      ])
    ])

    const statuses = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    }

    orderStatuses.forEach(item => {
      statuses[item._id] = item.count
    })

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue: Number(revenueResult[0]?.totalRevenue || 0),
        totalOrders,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        orderStatuses: statuses
      }
    })

  } catch (error) {
    console.error('Analytics overview error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve business overview'
    })
  }
}

const getRevenue = async (req, res) => {
  try {
    const tenantId = req.tenant._id
    const { from, to } = req.query

    const endDate = to ? new Date(to) : new Date()
    const startDate = from
      ? new Date(from)
      : new Date(endDate.getTime() - 29 * 24 * 60 * 60 * 1000)

    if (
      (from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) ||
      (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) ||
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      startDate > endDate
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date range. Use YYYY-MM-DD.'
      })
    }

    endDate.setUTCHours(23, 59, 59, 999)

    const revenue = await Order.aggregate([
      {
        $match: {
          tenantId,
          paymentStatus: 'paid',
          orderStatus: { $ne: 'cancelled' },
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'Asia/Kolkata'
            }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          revenue: 1,
          orders: 1
        }
      }
    ])

    return res.status(200).json({
      success: true,
      from: startDate,
      to: endDate,
      data: revenue
    })

  } catch (error) {
    console.error('Revenue analytics error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve revenue analytics'
    })
  }
}

const getOrderStatistics = async (req, res) => {
  try {
    const tenantId = req.tenant._id

    const statistics = await Order.aggregate([
      { $match: { tenantId } },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ])

    return res.status(200).json({
      success: true,
      data: statistics.map(item => ({
        status: item._id,
        count: item.count,
        amount: item.amount
      }))
    })

  } catch (error) {
    console.error('Order analytics error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve order statistics'
    })
  }
}

module.exports = {
  getOverview,
  getRevenue,
  getOrderStatistics
}
