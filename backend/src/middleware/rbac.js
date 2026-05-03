import ProjectMember from '../models/ProjectMember.js';

// check if the user is actually part of this project
export const checkProjectMembership = async (req, res, next) => {
  try {
    
    const projectId = req.params.projectId || req.params.id;

    if (!projectId) {
      return res.status(400).json({ success: false, message: 'Project ID is missing' });
    }

    const membership = await ProjectMember.findOne({
      projectId,
      userId: req.user._id,
    });

    if (!membership) {
      return res.status(403).json({ success: false, message: 'You do not have access to this project' });
    }

    req.projectRole = membership.role;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking permissions' });
  }
};

// make sure they have a specific role (like admin)
export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.projectRole !== requiredRole) {
      return res.status(403).json({ success: false, message: 'Only admins can do this' });
    }
    next();
  };
};
