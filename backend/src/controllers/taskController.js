import Task from '../models/Task.js';
import ProjectMember from '../models/ProjectMember.js';

// create a task
// admins can assign to anyone, members auto-assign to themselves
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate, status } = req.body;
    const projectId = req.params.projectId;
    const isAdmin = req.user.role === 'admin';

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    let finalAssignee = null;

    if (isAdmin && assignedTo) {
      // admin is assigning to someone — verify they're in the project
      const isMember = await ProjectMember.findOne({ projectId, userId: assignedTo });
      if (!isMember) {
        return res.status(400).json({ success: false, message: 'Assignee is not a member of this project' });
      }
      finalAssignee = assignedTo;
    } else if (!isAdmin) {
      // member creating a task — force assign to themselves
      finalAssignee = req.user._id;
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      projectId,
      assignedTo: finalAssignee,
      createdBy: req.user._id,
      dueDate: dueDate || null,
    });

    await task.populate('assignedTo', 'name email');
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get all tasks for a specific project
export const getProjectTasks = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { status, assignedTo } = req.query;

    const query = { projectId };
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .sort('dueDate');

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get a single task by its id
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, projectId: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// update a task
// admins can change anything. members can edit their own tasks (title, desc, status, priority, dueDate) but NOT the assignee.
export const updateTask = async (req, res) => {
  try {
    const { taskId, projectId } = req.params;
    const isAdmin = req.user.role === 'admin';

    let task = await Task.findOne({ _id: taskId, projectId });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const isOwner = task.assignedTo?.toString() === req.user._id.toString()
                 || task.createdBy?.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'You can only update your own tasks' });
    }

    // everyone can update these fields on their own tasks
    if (req.body.title) task.title = req.body.title;
    if (req.body.description !== undefined) task.description = req.body.description;
    if (req.body.status) task.status = req.body.status;
    if (req.body.priority) task.priority = req.body.priority;
    if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate;

    // only admins can change the assignee
    if (isAdmin) {
      if (req.body.assignedTo && req.body.assignedTo !== task.assignedTo?.toString()) {
        const isMember = await ProjectMember.findOne({ projectId, userId: req.body.assignedTo });
        if (!isMember) {
          return res.status(400).json({ success: false, message: 'New assignee is not a member of this project' });
        }
        task.assignedTo = req.body.assignedTo;
      } else if (req.body.assignedTo === null) {
        task.assignedTo = null;
      }
    }

    await task.save();
    await task.populate('assignedTo', 'name email');

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// delete a task — admins can delete any, members can delete their own
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, projectId: req.params.projectId });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = task.assignedTo?.toString() === req.user._id.toString()
                 || task.createdBy?.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'You can only delete your own tasks' });
    }

    await Task.findByIdAndDelete(task._id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get all tasks assigned to the current user across all projects
export const getMyTasks = async (req, res) => {
  try {
    const { status, overdue } = req.query;

    const query = { assignedTo: req.user._id };

    if (status) {
      query.status = status;
    }

    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: 'done' };
    }

    const tasks = await Task.find(query)
      .populate('projectId', 'name')
      .sort('dueDate');

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
