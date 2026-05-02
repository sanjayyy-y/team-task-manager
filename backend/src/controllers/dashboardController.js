import ProjectMember from '../models/ProjectMember.js';
import Task from '../models/Task.js';
import mongoose from 'mongoose';

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // first, how many projects are they part of?
    const memberships = await ProjectMember.find({ userId });
    const projectIds = memberships.map((m) => m.projectId);

    // if they aren't in any projects, just return zeros
    if (projectIds.length === 0) {
      return res.json({
        success: true,
        data: {
          projectCount: 0,
          totalTasks: 0,
          byStatus: { todo: 0, inProgress: 0, done: 0 },
          overdue: 0,
        },
      });
    }

    // using a MongoDB aggregation pipeline here because it's much faster 
    // to do the math in the database rather than pulling hundreds of tasks into Node
    const stats = await Task.aggregate([
      // step 1: grab all tasks in the projects this user has access to
      { $match: { projectId: { $in: projectIds } } },
      
      // step 2: group everything together and tally up the stats
      {
        $group: {
          _id: null, // we want one big summary object
          totalTasks: { $sum: 1 },
          todo: {
            $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
          },
          done: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', 'done'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // if there are tasks, stats[0] will have the numbers. otherwise set defaults
    const result = stats[0] || { totalTasks: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 };

    res.json({
      success: true,
      data: {
        projectCount: projectIds.length,
        totalTasks: result.totalTasks,
        byStatus: {
          todo: result.todo,
          inProgress: result.inProgress,
          done: result.done,
        },
        overdue: result.overdue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
