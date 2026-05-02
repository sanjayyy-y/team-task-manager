import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks/me');
      setTasks(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, projectId, newStatus) => {
    try {
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      await api.put(`/projects/${projectId}/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      fetchTasks();
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  if (loading) return <div className="loading">Loading your tasks...</div>;

  const pillFor = (status) => {
    if (status === 'done') return 'pill-green';
    if (status === 'in-progress') return 'pill-blue';
    return 'pill-gray';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Tasks</h1>
          <div className="date">All tasks assigned to you across projects</div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <h3>You're all caught up!</h3>
          <p>No tasks assigned to you right now.</p>
        </div>
      ) : (
        <div className="tasks-table">
          <div className="task-table-row task-table-header">
            <div>Task</div>
            <div>Project</div>
            <div>Due date</div>
            <div>Status</div>
          </div>
          {tasks.map(task => (
            <div key={task._id} className="task-table-row">
              <div>
                <div className="task-name">{task.title}</div>
              </div>
              <div>
                <Link to={`/projects/${task.projectId?._id}`} style={{ fontSize: '0.85rem' }}>
                  {task.projectId?.name || 'Unknown'}
                </Link>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {task.dueDate ? (
                  <><Calendar size={13} /> {new Date(task.dueDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</>
                ) : '—'}
              </div>
              <div>
                <select
                  value={task.status}
                  onChange={e => handleStatusChange(task._id, task.projectId?._id, e.target.value)}
                  className="status-select"
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
