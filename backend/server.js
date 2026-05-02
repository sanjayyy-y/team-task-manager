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

// routes
import authRoutes from './src/routes/authRoutes.js';

app.use('/api/auth', authRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/dashboard', dashboardRoutes);

// --------------- Start Server ---------------
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
