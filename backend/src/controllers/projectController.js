import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';
import User from '../models/User.js';
import Task from '../models/Task.js';

// create a new project and make the creator an admin automatically
export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
    });

    // they made it, so they should be an admin right away
    await ProjectMember.create({
      projectId: project._id,
      userId: req.user._id,
      role: 'admin',
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// fetch all projects the user is involved in
export const getProjects = async (req, res) => {
  try {
    // first figure out which projects they belong to
    const memberships = await ProjectMember.find({ userId: req.user._id });
    const projectIds = memberships.map((m) => m.projectId);

    // now get the actual project details
    const projects = await Project.find({ _id: { $in: projectIds } }).sort('-createdAt');

    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// grab a single project along with its tasks and members
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // pull in the members and populate their name/email so the UI can show them
    const members = await ProjectMember.find({ projectId: project._id })
      .populate('userId', 'name email');

    res.json({
      success: true,
      data: {
        project,
        members,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// update just the basics
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, description: req.body.description },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// delete the project and wipe its associated data so we don't leave junk behind
export const deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    await ProjectMember.deleteMany({ projectId: req.params.id });
    await Task.deleteMany({ projectId: req.params.id });

    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// add a new teammate
export const addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    
    // find the user they want to add
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ success: false, message: 'No user found with that email' });
    }

    // see if they are already in the project
    const existing = await ProjectMember.findOne({
      projectId: req.params.id,
      userId: userToAdd._id,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'They are already in this project' });
    }

    const member = await ProjectMember.create({
      projectId: req.params.id,
      userId: userToAdd._id,
      role: role || 'member', // default to regular member just in case
    });

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// bump someone to admin or back to member
export const updateMemberRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id, userId } = req.params;

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be admin or member' });
    }

    const member = await ProjectMember.findOneAndUpdate(
      { projectId: id, userId },
      { role },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// kick someone out of the project
export const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    // don't let people remove themselves to avoid zero-admin situations, 
    // though normally we'd allow leaving. for simplicity, just prevent self-removal for admins
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ success: false, message: 'You cannot remove yourself' });
    }

    const member = await ProjectMember.findOneAndDelete({ projectId: id, userId });
    
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.json({ success: true, message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
