import { Router } from 'express';
import { getMyTasks } from '../controllers/taskController.js';
import auth from '../middleware/auth.js';

const router = Router();

// gotta be logged in to see your tasks
router.use(auth);

// fetches tasks assigned to you across all your projects
router.get('/me', getMyTasks);

export default router;
