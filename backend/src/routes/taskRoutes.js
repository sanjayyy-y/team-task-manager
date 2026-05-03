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

// mergeParams is crucial here so we can grab the :projectId from the URL
const router = Router({ mergeParams: true });

// all these routes require you to be logged in and actually be in the project
router.use(auth);
router.use(checkProjectMembership);

router.route('/')
  .post(createTask) // both roles can create — controller handles assignment rules
  .get(getProjectTasks);

router.route('/:taskId')
  .get(getTaskById)
  .put(updateTask) // controller checks ownership for members
  .delete(deleteTask); // controller checks ownership for members

export default router;
