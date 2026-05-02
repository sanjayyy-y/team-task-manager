import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks/me');
      setTasks(res.data.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, projectId, newStatus) => {
    try {
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      await api.put(`/projects/${projectId}/tasks/${taskId}`, { status: newStatus });
    } catch (error) {
      fetchTasks(); // revert on failure
      toast.error(error.response?.data?.message || 'Failed to update task');
    }
  };

  if (loading) return <div className="loading-screen">Loading your tasks...</div>;

  return (
    <div className="my-tasks-page">
      <div style={{ marginBottom: '2rem' }}>
        <h1>My Tasks</h1>
        <p style={{ color: 'var(--text-secondary)' }}>All tasks assigned to you across all projects</p>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state glass">
          <h3>You're all caught up!</h3>
          <p>No tasks assigned to you right now.</p>
        </div>
      ) : (
        <div className="tasks-list glass" style={{ padding: '2rem' }}>
          {tasks.map(task => (
            <div key={task._id} className="task-list-item" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>{task.title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  {task.description}
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <span>
                    Project: <Link to={`/projects/${task.projectId._id}`} style={{ color: 'var(--primary-color)' }}>{task.projectId.name}</Link>
                  </span>
                  {task.dueDate && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} /> 
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              
              <select 
                value={task.status} 
                onChange={(e) => handleStatusChange(task._id, task.projectId._id, e.target.value)}
                className="status-select"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
