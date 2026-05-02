import Task from '../models/Task.js';
import ProjectMember from '../models/ProjectMember.js';

// create a new task (admins only)
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;
    const projectId = req.params.projectId;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    // if assigning to someone, make sure they are actually in the project
    if (assignedTo) {
      const isMember = await ProjectMember.findOne({ projectId, userId: assignedTo });
      if (!isMember) {
        return res.status(400).json({ success: false, message: 'Assignee is not a member of this project' });
      }
    }

    const task = await Task.create({
      title,
      description,
      status: 'todo',
      priority: priority || 'medium',
      projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      dueDate: dueDate || null,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get all tasks for a specific project
export const getProjectTasks = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { status, assignedTo } = req.query; // optional filters

    // build the query dynamically based on what they want
    const query = { projectId };
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    // fetch tasks and include assignee details
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .sort('dueDate'); // sort by due date so urgent stuff is up top

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

// update a task. admins can change anything, members can only change the status of their own tasks.
export const updateTask = async (req, res) => {
  try {
    const { taskId, projectId } = req.params;
    const role = req.projectRole; // we get this from the checkProjectMembership middleware

    let task = await Task.findOne({ _id: taskId, projectId });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // if they are just a regular member, enforce the strict rules
    if (role === 'member') {
      // they can only edit their own tasks
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only update your own tasks' });
      }

      // they can only change the status, ignore any other fields they sent
      task.status = req.body.status || task.status;
    } else {
      // they are an admin, let them change whatever they want
      task.title = req.body.title || task.title;
      task.description = req.body.description !== undefined ? req.body.description : task.description;
      task.status = req.body.status || task.status;
      task.priority = req.body.priority || task.priority;
      task.dueDate = req.body.dueDate !== undefined ? req.body.dueDate : task.dueDate;
      
      // changing assignment requires checking if the new person is in the project
      if (req.body.assignedTo && req.body.assignedTo !== task.assignedTo?.toString()) {
        const isMember = await ProjectMember.findOne({ projectId, userId: req.body.assignedTo });
        if (!isMember) {
          return res.status(400).json({ success: false, message: 'New assignee is not a member of this project' });
        }
        task.assignedTo = req.body.assignedTo;
      } else if (req.body.assignedTo === null) {
        task.assignedTo = null; // unassign
      }
    }

    await task.save();
    
    // repopulate the assignee info before sending back
    await task.populate('assignedTo', 'name email');

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// delete a task (admins only)
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.taskId, projectId: req.params.projectId });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

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

    // if they want overdue tasks, look for tasks due before right now that aren't done yet
    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: 'done' };
    }

    const tasks = await Task.find(query)
      .populate('projectId', 'name') // include project name so they know where it belongs
      .sort('dueDate');

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
