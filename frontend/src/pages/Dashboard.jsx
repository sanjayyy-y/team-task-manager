import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FolderKanban,
  Calendar
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/tasks/me')
        ]);
        
        setStats(statsRes.data.data);
        // just show the top 5 most recent tasks for the dashboard
        setMyTasks(tasksRes.data.data.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="loading-screen">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <h1 style={{ marginBottom: '0.5rem' }}>Welcome back, {user?.name.split(' ')[0]} 👋</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Here's what's happening with your projects today.
      </p>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon" style={{ color: 'var(--primary-color)' }}>
            <FolderKanban size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats?.projectCount || 0}</h3>
            <p>Active Projects</p>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon" style={{ color: 'var(--status-in-progress)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats?.byStatus?.inProgress || 0}</h3>
            <p>Tasks In Progress</p>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon" style={{ color: 'var(--status-done)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats?.byStatus?.done || 0}</h3>
            <p>Tasks Completed</p>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon" style={{ color: 'var(--status-overdue)' }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats?.overdue || 0}</h3>
            <p>Tasks Overdue</p>
          </div>
        </div>
      </div>

      {/* Recent Tasks List */}
      <div className="recent-tasks glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Your Recent Tasks</h2>
          <Link to="/tasks" style={{ fontSize: '0.875rem' }}>View all tasks →</Link>
        </div>

        {myTasks.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>You don't have any tasks assigned right now.</p>
        ) : (
          <div className="task-list">
            {myTasks.map(task => (
              <div key={task._id} className="task-list-item">
                <div>
                  <h4 style={{ marginBottom: '0.25rem' }}>{task.title}</h4>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span>Project: {task.projectId?.name || 'Unknown'}</span>
                    {task.dueDate && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={14} /> 
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className={`status-badge status-${task.status}`}>
                  {task.status.replace('-', ' ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
