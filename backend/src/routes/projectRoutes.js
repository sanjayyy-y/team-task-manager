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

const router = Router();

// all project routes require the user to be logged in
router.use(auth);

// create and list projects
router.route('/')
  .post(createProject)
  .get(getProjects);

// view, edit, or delete a specific project
router.route('/:id')
  .get(checkProjectMembership, getProjectById) // anyone in the project can view it
  .put(checkProjectMembership, requireRole('admin'), updateProject) // only admins can edit
  .delete(checkProjectMembership, requireRole('admin'), deleteProject); // only admins can delete

// invite teammates
router.route('/:id/members')
  .post(checkProjectMembership, requireRole('admin'), addMember);

// manage existing teammates (change roles or kick them)
router.route('/:id/members/:userId')
  .put(checkProjectMembership, requireRole('admin'), updateMemberRole)
  .delete(checkProjectMembership, requireRole('admin'), removeMember);

export default router;
