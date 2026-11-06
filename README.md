# Mini Food Ordering System

A full-stack, transactional food ordering and order-tracking application built with Node.js, Express, and MySQL/TiDB.

---

## Features

### 🍽️ Dynamic Menu Browsing
- **Real-Time Menu Fetching**: Fetches active menu items directly from the database with real-time pricing and availability checks.
- **Category Filtering**: Filter dishes by categories (Starters, Mains, Desserts, Beverages) or browse the complete menu.
- **Dietary & Item Badging**: Highlights item details including pricing, descriptions, vegetarian indicators, and current availability status.

### 🛒 Seamless Cart & Checkout
- **Interactive Cart Management**: Add items to your cart, adjust item quantities up or down on the fly, or remove them with automatic price recalculation.
- **Instant Total Calculation**: Automatically computes subtotal and grand total dynamically without page reloads.
- **Customer Details Validation**: Collects and validates customer contact information (name and phone number) before checkout.

### 📦 Transactional Order Placement
- **ACID-Compliant Order Processing**: Uses database transactions to ensure orders and individual order line items are created together atomically.
- **Availability Safeguards**: Validates item availability in real time during order creation, rejecting orders containing unavailable or deleted items.
- **Precision Currency & Bounds Checking**: Accurately computes totals using decimal precision to avoid floating-point rounding errors.

### 🔄 Order Lifecycle & Status Tracking
- **Live Order Status Tracking**: Look up any order by ID to monitor its progress in real time.
- **Strict State Machine Workflow**: Enforces a validated order lifecycle to prevent invalid state skips:
  $$\text{PLACED} \longrightarrow \text{PREPARING} \longrightarrow \text{DELIVERED}$$
- **Order Progression Controls**: Allows updating order states sequentially from pending preparation to successful delivery.
- **Order History & Status Filtering**: Filter and inspect past orders across any stage of fulfillment.

### 🎨 Responsive & Accessible UI
- **Single-Page Simplicity**: Fast, zero-dependency lightweight frontend interface for quick ordering.
- **Light & Dark Theme Support**: Automatically adapts to system dark or light appearance preferences with smooth CSS transitions.
- **Mobile-Responsive Layout**: Clean two-column desktop interface that folds seamlessly into a single-column layout on phones and tablets.

### 🛡️ Robust Backend & Reliability
- **Input Sanitization & Validation**: Comprehensive guards against invalid inputs, malformed IDs, negative quantities, or oversized payloads.
- **Connection Pooling**: Utilizes high-performance MySQL connection pooling for efficient connection reuse and scaling.
- **SSL / TLS Cloud Support**: Built-in support for encrypted cloud database connections (TiDB Cloud, AWS RDS, Aiven).
- **Health Check Endpoint**: Includes `/health` endpoint to monitor application and database availability for cloud orchestrators and uptime monitors.
- **Containerized**: Fully Dockerized with lightweight Alpine Linux for consistent deployment across local Docker Compose, Render, or Railway.

---

## API Capabilities

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/menu` | Retrieve all available menu items (supports `?category=...`) |
| `POST` | `/orders` | Place a new customer order with line items |
| `GET` | `/orders` | Retrieve list of orders (supports filtering by `?status=...`) |
| `GET` | `/orders/:id` | Fetch detailed information for a specific order |
| `PATCH` | `/orders/:id/status` | Advance order status (`PLACED` → `PREPARING` → `DELIVERED`) |
| `GET` | `/health` | Service and database connectivity health check |

---

## Quick Start

### 1. Configure Environment
Create a `.env` file in `server/` (refer to `.env.example`):
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=root123
DB_NAME=express_demo
DB_SSL=false
```

### 2. Run with Docker Compose (Local Stack)
```bash
docker compose -f infra/docker-compose.yml up --build
```

### 3. Or Run Locally with Node.js
```bash
cd server
npm install
npm start
```

Visit `http://localhost:3000` in your browser.
