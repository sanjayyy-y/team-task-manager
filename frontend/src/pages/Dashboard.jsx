import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Plus } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [stats, setStats] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectStats, setProjectStats] = useState({});
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

        const projs = projRes.data.data.slice(0, 3);
        setProjects(projs);

        // fetch per-project task counts for accurate progress bars
        const statsMap = {};
        await Promise.all(projs.map(async (proj) => {
          try {
            const taskRes = await api.get(`/projects/${proj._id}/tasks`);
            const allTasks = taskRes.data.data;
            const done = allTasks.filter(t => t.status === 'done').length;
            statsMap[proj._id] = { total: allTasks.length, done };
          } catch {
            statsMap[proj._id] = { total: 0, done: 0 };
          }
        }));
        setProjectStats(statsMap);
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

  const statusMeta = (task) => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
    if (isOverdue) return { dot: 'var(--c-red)', pillClass: 'pill-red', label: 'Overdue' };
    if (task.status === 'done') return { dot: 'var(--c-green)', pillClass: 'pill-green', label: 'Done' };
    if (task.status === 'in-progress') return { dot: 'var(--c-blue)', pillClass: 'pill-blue', label: 'In progress' };
    return { dot: 'var(--c-gray)', pillClass: 'pill-gray', label: 'Todo' };
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="date">{today}</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => navigate('/projects')}>
            <Plus size={14} /> New Project
          </button>
        )}
      </div>

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

      <div className="dash-grid">
        <div className="dash-panel">
          <h2>{isAdmin ? 'Recent tasks' : 'Your tasks'}</h2>
          {myTasks.length === 0 ? (
            <p style={{ color: 'var(--text-2)', fontSize: '13px' }}>No tasks yet.</p>
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
            <p style={{ color: 'var(--text-2)', fontSize: '13px' }}>No projects yet.</p>
          ) : (
            projects.map(proj => {
              const ps = projectStats[proj._id] || { total: 0, done: 0 };
              const pct = ps.total > 0 ? Math.round((ps.done / ps.total) * 100) : 0;
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
