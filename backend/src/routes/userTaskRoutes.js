import { Router } from 'express';
import { getMyTasks } from '../controllers/taskController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.get('/me', getMyTasks);

export default router;
