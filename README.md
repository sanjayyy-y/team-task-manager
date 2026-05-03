<div align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge&logo=react" alt="MERN Stack" />
  <img src="https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/Security-Helmet_&_Rate_Limiting-green?style=for-the-badge&logo=shield" alt="Security" />

  <h1>🚀 TeamTask Manager</h1>
  <p>A highly polished, full-stack project management and team collaboration platform built with the MERN stack.</p>

  **[View Live Demo (Frontend)](https://team-task-manager-gold-phi.vercel.app/) | [Backend API Health Check](https://team-task-manager-production-135c.up.railway.app/api/health)**
</div>

<br />

## ✨ Features

- **🛡️ Role-Based Access Control (RBAC)**: Distinct permissions for **Admins** (create projects, manage teams, assign tasks) and **Members** (view projects, update statuses).
- **📊 Advanced Project Management**: Dedicated workspaces per project featuring a 5-metric analytical view (Total, Assigned to Me, In Progress, Completed, Overdue).
- **👥 Cross-Project Teams Directory**: Allows Admins to aggregate teams and view a specific member's workload across *all* active projects simultaneously.
- **⚡ Optimistic UI Updates**: Status changes reflect instantaneously on the client side, only rolling back if the server encounters an error.
- **⏳ Undo Pattern for Destructive Actions**: Deleting tasks or projects initiates a 5-second buffer with a toast notification allowing the user to `Undo` the action before the database is hit.
- **🎨 Premium UI/UX & Micro-interactions**: 
  - Buttery-smooth mount animations and staggered list reveals powered by `framer-motion`.
  - Custom shimmering `Skeleton` loaders replacing generic loading spinners.
  - Hover-only action buttons and dynamic CSS color transitions.
- **🔒 Production-Grade Security**: Hardened backend utilizing `helmet.js` for HTTP headers, `express-rate-limit` to thwart brute-force attacks on auth routes, and strict CORS policies.

## 🛠️ Tech Stack

**Frontend**
- React.js (Vite)
- React Router DOM v6
- Framer Motion (Animations)
- React Hot Toast (Notifications)
- Lucide React (Icons)
- Vanilla CSS (Custom Design System)

**Backend**
- Node.js & Express.js
- MongoDB (Mongoose ODM)
- JSON Web Tokens (JWT) for stateless authentication
- bcrypt.js (Password hashing)
- Compression & Helmet (Optimization and Security)

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas URI (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/team-task-manager.git
cd team-task-manager
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `/backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
```
Run the server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env` file in the `/frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Run the client:
```bash
npm run dev
```

## 📂 Folder Structure

```text
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── controllers/  # Route logic
│   │   ├── middleware/   # Auth & Security middlewares
│   │   ├── models/       # Mongoose schemas
│   │   └── routes/       # Express route definitions
│   ├── server.js         # Entry point
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI & Layout components
    │   ├── context/      # React Context (Auth)
    │   ├── hooks/        # Custom hooks
    │   ├── pages/        # Route views (Dashboard, Project, Teams)
    │   ├── services/     # Axios API instances
    │   ├── index.css     # Global theme, tokens, animations
    │   └── App.jsx
    └── .env
```

## 🔒 API Endpoints Overview

- **Auth:** `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- **Projects:** `GET /api/projects`, `POST /api/projects`, `DELETE /api/projects/:id`
- **Tasks:** `GET /api/projects/:projectId/tasks`, `POST /api/projects/:projectId/tasks`, `PUT /api/projects/:projectId/tasks/:id`
- **Teams:** `GET /api/teams`, `POST /api/teams`, `GET /api/teams/user/:userId/tasks`

<br />

<div align="center">
  <i>Designed and developed by Sanjay.</i>
</div>
