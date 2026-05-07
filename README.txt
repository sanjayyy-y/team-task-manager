Team Task Manager - Assignment Submission
==========================================

Live Links
----------
Frontend (Vercel): https://team-task-manager-gold-phi.vercel.app/
Backend API (Railway): https://team-task-manager-production-135c.up.railway.app/api/health

Project Overview
----------------
Team Task Manager is a full-stack, responsive web application built with the MERN stack designed to streamline project management and cross-collaboration for teams. It allows Administrators to create projects, assign tasks to members, track team workloads, and manage cross-project resources efficiently.

Key Features
------------
1. Role-Based Access Control (RBAC):
   - Admin: Can create/delete projects, manage teams, invite members, and assign tasks.
   - Member: Can view projects, update their assigned tasks, and see team directories.

2. Project Management:
   - Create projects with descriptive overviews.
   - 5-card analytical view per project (Total, My Tasks, In Progress, Completed, Overdue).
   - Custom dynamic filtering for task views based on status and assignee.

3. Cross-Project Teams Directory:
   - Dedicated "Teams" workspace for Admins to view all members in a specific department/group.
   - View aggregated analytics for individual members across *all* projects they belong to.

4. Modern UI/UX Enhancements:
   - Built with custom dark-mode aesthetics focusing on high-contrast and readability.
   - Shimmering Skeleton loaders replace generic spinners for better perceived performance.
   - Smooth staggered micro-animations and mounting transitions powered by Framer Motion.
   - "Undo" toast notifications for critical destructive actions (delaying API calls by 5s).
   - Optimistic UI updates for snappy, instant status changes.

5. Production-Ready Security & Performance:
   - Implemented helmet.js for strict HTTP response headers.
   - Rate limiting on Auth routes (max 10 requests per 15 minutes) to prevent brute force attacks.
   - Gzip compression enabled for faster payload delivery.
   - Dynamic CORS configuration enforcing strict origin matching in production.

Tech Stack
----------
- Frontend: React (Vite), React Router DOM, Framer Motion, react-hot-toast, Lucide React, Vanilla CSS.
- Backend: Node.js, Express.js, MongoDB (Mongoose).
- Security/Middleware: JSON Web Tokens (JWT), bcryptjs, express-rate-limit, helmet, cors, compression.

How to Run Locally
------------------
1. Clone the repository.
2. Install dependencies:
   - `cd backend` -> `npm install`
   - `cd frontend` -> `npm install`
3. Environment Setup:
   - Backend `.env`: `PORT=5000`, `MONGO_URI=<your_atlas_url>`, `JWT_SECRET=<secret>`, `CLIENT_URL=http://localhost:5173`
   - Frontend `.env`: `VITE_API_URL=http://localhost:5000/api`
4. Start development servers:
   - Backend: `npm run dev`
   - Frontend: `npm run dev`
