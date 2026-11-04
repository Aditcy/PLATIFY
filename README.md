# PLATIFY

### Retail Commerce & Store Management Platform

PLATIFY is a multi-tenant retail commerce and store management platform designed to help independent retail businesses manage their online storefronts, products, inventory, customers, orders and business operations through a unified system.

## Project Overview

The platform aims to provide:

- Multi-tenant retail business management
- Customer-facing online storefronts
- Product and category management
- Inventory and stock tracking
- Order and customer management
- Business analytics and reporting
- Role-based access control
- Online payment integration

**Demonstration Store:** UrbanThread

## Technology Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

## Project Structure

```text
PLATIFY/
├── client/
│   ├── public/
│   └── src/
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

## Local Development Setup

### Prerequisites

- Node.js
- npm
- MongoDB Atlas account

### Installation

Clone the repository and install dependencies:

```bash
npm install
cd client && npm install
cd ../server && npm install
```

Configure environment variables using the provided `.env.example` files.

### Run the application

From the project root:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

API health check: `http://localhost:5000/api/health`

Database health check: `http://localhost:5000/api/health/db`

## Development Status

**Stage 1 — Project Foundation**

- React and Vite frontend initialized
- Tailwind CSS configured
- Express backend initialized
- Frontend and backend API integration established
- MongoDB Atlas connected using Mongoose
- Database health monitoring endpoint implemented
- Unified development environment configured

Further application modules are under development.

## License

This project is currently developed as an educational and portfolio project.
