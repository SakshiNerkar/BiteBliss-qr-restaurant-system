# BiteBliss 🍔
**A Modern, Responsive Food Ordering & Restaurant Management System**

BiteBliss is a full-stack web application designed for restaurants to modernize their dining experience. It features a complete **QR-based Customer Menu Flow** for contactless ordering and a powerful **SaaS-style Admin Dashboard** for restaurant managers to track revenues, manage menus, and monitor live kitchen orders.

---

## 🌟 Key Features

### For Customers (Mobile-First Experience)
- **QR Code Integration:** Scan a QR code at your table to instantly load the menu assigned to your specific table (e.g., `/:restaurantId/:tableNo`).
- **Interactive Menu:** Browse categories, view high-quality item images, and check real-time availability.
- **Zomato-style Cart & Checkout:** Add items with detailed quantity controls, leave special instructions, and view recommended pairings. 
- **Sticky Live Bill & Action Bar:** Keep track of your running total securely hovering above a global navigation bar.
- **Live Order Tracking:** A visual, step-by-step timeline detailing order progress from "Pending" to "Served."
- **Seamless Payments:** Integrated Stripe Support for secure card payments right from the table.

### For Restaurant Owners (Desktop Dashboard)
- **Advanced Analytics Hub:** Monitor Total Revenue, Daily Orders, Most Popular Items, and active tables with a visually stunning widget dashboard using Recharts.
- **Menu Management:** Fully interactive CRUD (Create, Read, Update, Delete) controls to categorize items, upload images, and control stock.
- **Kitchen Display System (KDS):** A live table pipeline tracking order statuses, alerting the kitchen to new tickets.
- **Table & QR Generation:** Manage physical tables, assign capacities, and dynamically generate custom QR codes to place on tables.
- **Dark Mode Support:** A sleek, fully implemented dark theme across the entire Admin experience.

---

## 💻 Tech Stack

- **Frontend:** React (Vite), Redux Toolkit (RTK Query), Tailwind CSS, React-Icons, Recharts
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Authentication:** JSON Web Tokens (JWT)
- **Payments:** Stripe API integration
- **File Storage:** Multer (Local static image uploading)

---

## 🚀 Quick Setup Guide

### Prerequisites
- Node.js (v18+)
- MongoDB (Local URI or Atlas Cloud URI)
- Stripe Account (for payment keys)

### 1. Backend Initialization
Open a terminal in the `backend` folder:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder with the following credentials:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```

### 2. Frontend Initialization
Open a second terminal in the `frontend` folder:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder with the following credentials:
```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
```

Start the frontend development server:
```bash
npm run dev
```

### 3. Usage
- Admin Dashboard: Navigate to `http://localhost:5173/admin`
- Customer Flow: Navigate to `http://localhost:5173/bitebliss/1` (simulating Table 1)

---

## 📦 Deployment

### Backend
The backend relies on local file storage (`multer`) for menu images. Therefore, it is recommended to deploy the backend to a provider that supports persistent disks or background tasks, such as **Render** (Web Service).

### Frontend
Since the React frontend is a Single Page Application, it can be easily deployed to serverless hosts like **Vercel** or **Netlify**. Ensure the environment variable `VITE_API_URL` is set to point to your deployed backend URL.

---
*Built with ❤️ for modern dining.*
