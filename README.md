# TeamTask 🚀

TeamTask is an enterprise-grade project and team management application. It provides a beautiful, heavily animated, "Pure Dark" UI (inspired by Linear) allowing companies to organize independent employee teams, manage projects, and track tasks with robust Role-Based Access Control (RBAC).

## ✨ Features

- **Role-Based Access Control (RBAC)**: Distinct permissions for `Admin` and `Member` roles.
  - *Admins*: Full control over project creation, team creation, cross-project task assignment, member invites, and permanent deletions.
  - *Members*: Focused view of their assigned work. Can create self-assigned tasks and update status, but cannot manage projects or teams.
- **Enterprise Team Management**: Standalone "Teams" directory to group employees. Admins can view cross-project workloads for specific team members instantly.
- **Beautiful, Fluid UI**: Powered by **Framer Motion**. Features stagger-fade lists, smooth panel transitions, shimmer skeletons for loading states, and dynamic status CSS transitions.
- **Optimistic UI & Undo Pattern**: Tasks and projects utilize a 5-second "Undo" pattern via `react-hot-toast` before permanent deletion. Task status updates apply instantly to the UI and gracefully revert on API failure.
- **Security Hardened**: Built-in production-ready middleware including `helmet`, `compression`, dynamic CORS, and brute-force rate-limiting (`express-rate-limit`).

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, React Router DOM, Framer Motion, Lucide React, React Hot Toast.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JSON Web Tokens (JWT) for authentication.
- **Styling**: Vanilla CSS with a bespoke CSS Variables design system.

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local instance or Atlas connection string)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/team-task-manager.git
cd team-task-manager
```

### 2. Backend Setup
Navigate into the backend folder, install dependencies, and setup your `.env` file.
```bash
cd backend
npm install
```

Create a `.env` file in the `/backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/teamtask
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window, navigate into the frontend folder, and install dependencies.
```bash
cd frontend
npm install
```

Create a `.env` file in the `/frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

The application will now be running at `http://localhost:5173`.

---

## 🚀 Deployment

This project is structured for easy deployment to platforms like **Railway** (Backend) and **Vercel** (Frontend).

### Backend (Railway)
1. Connect your repository to Railway.
2. Under "Variables", define the following:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = `your_mongodb_atlas_uri`
   - `JWT_SECRET` = `your_super_secret_key`
   - `CLIENT_URL` = `https://your-vercel-domain.vercel.app` *(Must match your exact frontend domain for CORS)*
   - *(Note: Railway auto-assigns the `PORT` variable)*
3. Ensure your MongoDB Atlas Network Access allows connections from `0.0.0.0/0`.

### Frontend (Vercel)
1. Import the `/frontend` directory to Vercel.
2. Under "Environment Variables", set:
   - `VITE_API_URL` = `https://your-railway-backend-domain.up.railway.app/api`
3. Deploy!

## 🔐 Admin Account Creation
Currently, the first user to sign up will be assigned the `member` role by default. To make an Admin account for your initial setup, you will need to manually change the `role` field from `"member"` to `"admin"` for your user document directly inside your MongoDB database (using MongoDB Compass or Atlas UI). Once you have an Admin account, you can create teams and invite other users.
