import ProjectMember from '../models/ProjectMember.js';
import Task from '../models/Task.js';
import mongoose from 'mongoose';

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    
    const memberships = await ProjectMember.find({ userId });
    const projectIds = memberships.map((m) => m.projectId);

    
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

    
    const stats = await Task.aggregate([
      
      { $match: { projectId: { $in: projectIds } } },
      
      
      {
        $group: {
          _id: null, 
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
