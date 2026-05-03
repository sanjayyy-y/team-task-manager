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


router.get('/user/:userId/tasks', getUserTasks);

export default router;
