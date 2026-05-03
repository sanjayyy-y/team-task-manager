import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import auth from '../middleware/auth.js';

const router = Router();


router.use(auth);

router.get('/stats', getDashboardStats);

export default router;
