import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
} from '../controllers/projectController.js';
import auth from '../middleware/auth.js';
import { checkProjectMembership, requireRole } from '../middleware/rbac.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = Router();


router.use(auth);


router.route('/')
  .post(requireAdmin, createProject)
  .get(getProjects);
router.route('/:id')
  .get(checkProjectMembership, getProjectById) // anyone in the project can view it
  .put(checkProjectMembership, requireRole('admin'), updateProject) // only admins can edit
  .delete(checkProjectMembership, requireRole('admin'), deleteProject); // only admins can delete


router.route('/:id/members')
  .post(checkProjectMembership, requireRole('admin'), addMember);


router.route('/:id/members/:userId')
  .put(checkProjectMembership, requireRole('admin'), updateMemberRole)
  .delete(checkProjectMembership, requireRole('admin'), removeMember);

export default router;
