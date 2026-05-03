import { Router } from 'express';
import {
  createTeam,
  getTeams,
  getTeamById,
  addTeamMember,
  removeTeamMember,
  deleteTeam,
  getUserTasks,
} from '../controllers/teamController.js';
import auth from '../middleware/auth.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = Router();

// all team routes need auth + admin
router.use(auth);
router.use(requireAdmin);

router.route('/')
  .post(createTeam)
  .get(getTeams);

router.route('/:id')
  .get(getTeamById)
  .delete(deleteTeam);

router.route('/:id/members')
  .post(addTeamMember);

router.route('/:id/members/:userId')
  .delete(removeTeamMember);

// get all tasks for a specific user (admin viewing a team member's work)
router.get('/user/:userId/tasks', getUserTasks);

export default router;
