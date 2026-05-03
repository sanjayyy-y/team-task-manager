import { Router } from 'express';
import {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import auth from '../middleware/auth.js';
import { checkProjectMembership } from '../middleware/rbac.js';


const router = Router({ mergeParams: true });


router.use(auth);
router.use(checkProjectMembership);

router.route('/')
  .post(createTask) // both roles can create — controller handles assignment rules
  .get(getProjectTasks);

router.route('/:taskId')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

export default router;
