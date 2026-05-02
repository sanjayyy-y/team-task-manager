import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Plus } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, tasksRes, projRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/tasks/me'),
          api.get('/projects'),
        ]);
        setStats(statsRes.data.data);
        setMyTasks(tasksRes.data.data.slice(0, 4));
        setProjects(projRes.data.data.slice(0, 3));
      } catch (err) {
        console.error('Dashboard load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  // figure out the status info for the dot and pill
  const statusMeta = (task) => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
    if (isOverdue) return { dot: 'var(--c-red)', pillClass: 'pill-red', label: 'Overdue' };
    if (task.status === 'done') return { dot: 'var(--c-green)', pillClass: 'pill-green', label: 'Done' };
    if (task.status === 'in-progress') return { dot: 'var(--c-blue)', pillClass: 'pill-blue', label: 'In progress' };
    return { dot: 'var(--c-gray)', pillClass: 'pill-gray', label: 'Todo' };
  };

  // rough progress calc: done tasks / total tasks per project
  const calcProgress = (proj) => {
    // we don't have per-project task counts yet so use overall stats as a fallback
    if (!stats || stats.totalTasks === 0) return 0;
    return Math.round((stats.byStatus.done / stats.totalTasks) * 100);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="date">{today}</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/projects')}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Stat cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="label">Total tasks</div>
          <div className="value value-white">{stats?.totalTasks || 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">In progress</div>
          <div className="value value-blue">{stats?.byStatus?.inProgress || 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Completed</div>
          <div className="value value-green">{stats?.byStatus?.done || 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Overdue</div>
          <div className="value value-red">{stats?.overdue || 0}</div>
        </div>
      </div>

      {/* Two column: Recent tasks + Active projects */}
      <div className="dash-grid">
        <div className="dash-panel">
          <h2>Recent tasks</h2>
          {myTasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No tasks assigned to you yet.</p>
          ) : (
            myTasks.map(task => {
              const meta = statusMeta(task);
              return (
                <div className="task-row" key={task._id}>
                  <div className="task-dot" style={{ background: meta.dot }} />
                  <div className="task-row-name">{task.title}</div>
                  <span className={`pill ${meta.pillClass}`}>{meta.label}</span>
                </div>
              );
            })
          )}
        </div>

        <div className="dash-panel">
          <h2>Active projects</h2>
          {projects.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No projects yet.</p>
          ) : (
            projects.map(proj => {
              const pct = calcProgress(proj);
              return (
                <Link to={`/projects/${proj._id}`} key={proj._id} className="proj-item" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <div className="proj-item-name">{proj.name}</div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="proj-meta">{pct}% complete</div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
