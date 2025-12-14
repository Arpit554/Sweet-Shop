# 🍬 Sweet Shop Management System - Frontend

This is the **frontend** repository/part of the full-stack Sweet Shop Management System built with the **MERN stack**. It provides a responsive, role-based user interface for browsing sweets, purchasing, and admin management features. Authentication state and API communication are handled securely and efficiently.

## 📌 Features

### 👤 Authentication & Authorization
- User registration and login forms
- JWT token storage (secure httpOnly cookies or context-based management)
- Protected routes using React Router
- Role-based UI rendering (`USER` vs `ADMIN`)
- Automatic redirection for unauthorized access
- Secure logout (token clearance)

### 🍭 Sweet Management (User View)
- Browse all available sweets in a grid/card layout
- Search sweets by name
- Filter by category and price range
- View detailed sweet information
- Purchase sweets with real-time stock validation feedback
- Success/error notifications for purchases

### 🧑‍💼 Admin Dashboard
- Dedicated admin panel accessible only to ADMIN role
- CRUD operations for sweets:
  - Add new sweet (with form validation)
  - Edit existing sweet details
  - Delete sweet
  - Restock inventory (update quantity)
- Responsive tables/lists for inventory overview

### 🔔 Additional UI/UX Features
- Loading states and spinners
- Toast notifications for actions (success, error, info)
- Responsive design (mobile-friendly with Tailwind CSS)
- Context API for global state management (auth, user role)

## 🛠 Tech Stack
- **React** (with Vite for fast development)
- **Tailwind CSS** for styling
- **Axios** for API requests
- **React Router v6** for client-side routing and protected routes
- **Context API** for authentication and global state
- Optional: React Toastify or custom toast components

## 🗂 Project Structure
frontend/
├── src/
│   ├── components/          # Reusable UI components (Navbar, SweetCard, etc.)
│   ├── pages/               # Page components (Home, Login, Register, AdminDashboard, etc.)
│   ├── context/             # AuthContext and other providers
│   ├── api/                 # Axios instance and API endpoint functions
│   ├── assets/              # Images, icons, etc.
│   ├── App.jsx              # Main app with routes
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── tailwind.config.js
├── vite.config.js
└── package.json


## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- The backend server running at `http://localhost:3000` (or your configured URL)

### Installation
```bash
cd frontend
npm install