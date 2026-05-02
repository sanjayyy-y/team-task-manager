import { Router } from 'express';
import {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import auth from '../middleware/auth.js';
import { checkProjectMembership, requireRole } from '../middleware/rbac.js';

// mergeParams is crucial here so we can grab the :projectId from the URL
const router = Router({ mergeParams: true });

// all these routes require you to be logged in and actually be in the project
router.use(auth);
router.use(checkProjectMembership);

router.route('/')
  .post(requireRole('admin'), createTask) // only admins can make new tasks
  .get(getProjectTasks); // anyone in the project can view the list

router.route('/:taskId')
  .get(getTaskById) // anyone can view details
  .put(updateTask) // both can update, but the controller restricts what members can touch
  .delete(requireRole('admin'), deleteTask); // only admins can trash things

export default router;
