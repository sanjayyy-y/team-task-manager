import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import auth from '../middleware/auth.js';

const router = Router();

// protect the dashboard data
router.use(auth);

// GET /api/dashboard/stats
router.get('/stats', getDashboardStats);

export default router;
