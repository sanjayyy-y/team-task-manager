import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

//Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running 🚀' });
});

import authRoutes from './src/routes/authRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import taskRoutes from './src/routes/taskRoutes.js';
import userTaskRoutes from './src/routes/userTaskRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import teamRoutes from './src/routes/teamRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/tasks', userTaskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/teams', teamRoutes);


// --------------- Start Server ---------------
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
