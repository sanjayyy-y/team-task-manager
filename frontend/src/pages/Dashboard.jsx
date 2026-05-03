import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Skeleton from '../components/ui/Skeleton';

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

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <div className="page-header">
          <div>
            <Skeleton width="150px" height="32px" style={{ marginBottom: '8px' }} />
            <Skeleton width="200px" height="16px" />
          </div>
        </div>
        <div className="stats-row">
          {[1, 2, 3, 4].map(i => (
            <div className="stat-card" key={i}>
              <Skeleton width="80px" height="14px" style={{ marginBottom: '12px' }} />
              <Skeleton width="40px" height="28px" />
            </div>
          ))}
        </div>
        <div className="dash-grid">
          <div className="dash-panel">
            <Skeleton width="120px" height="24px" style={{ marginBottom: '16px' }} />
            {[1, 2, 3, 4].map(i => <Skeleton key={i} height="48px" style={{ marginBottom: '8px' }} />)}
          </div>
          <div className="dash-panel">
            <Skeleton width="120px" height="24px" style={{ marginBottom: '16px' }} />
            {[1, 2, 3].map(i => <Skeleton key={i} height="70px" style={{ marginBottom: '8px' }} />)}
          </div>
        </div>
      </motion.div>
    );
  }

  const statusMeta = (task) => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
    if (isOverdue) return { dot: 'var(--c-red)', pillClass: 'pill-red', label: 'Overdue' };
    if (task.status === 'done') return { dot: 'var(--c-green)', pillClass: 'pill-green', label: 'Done' };
    if (task.status === 'in-progress') return { dot: 'var(--c-blue)', pillClass: 'pill-blue', label: 'In progress' };
    return { dot: 'var(--c-gray)', pillClass: 'pill-gray', label: 'Todo' };
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
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
        <motion.div whileTap={{ scale: 0.97 }} className="stat-card">
          <div className="label">Total tasks</div>
          <div className="value value-white">{stats?.totalTasks || 0}</div>
        </motion.div>
        <motion.div whileTap={{ scale: 0.97 }} className="stat-card">
          <div className="label">In progress</div>
          <div className="value value-blue">{stats?.byStatus?.inProgress || 0}</div>
        </motion.div>
        <motion.div whileTap={{ scale: 0.97 }} className="stat-card">
          <div className="label">Completed</div>
          <div className="value value-green">{stats?.byStatus?.done || 0}</div>
        </motion.div>
        <motion.div whileTap={{ scale: 0.97 }} className="stat-card">
          <div className="label">Overdue</div>
          <div className="value value-red">{stats?.overdue || 0}</div>
        </motion.div>
      </div>

      <div className="dash-grid">
        <div className="dash-panel">
          <h2>{isAdmin ? 'Recent tasks' : 'Your tasks'}</h2>
          {myTasks.length === 0 ? (
            <p style={{ color: 'var(--text-2)', fontSize: '13px' }}>No tasks yet.</p>
          ) : (
            myTasks.map((task, i) => {
              const meta = statusMeta(task);
              return (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="task-row" key={task._id}
                >
                  <div className="task-dot" style={{ background: meta.dot }} />
                  <div className="task-row-name">{task.title}</div>
                  <span className={`pill ${meta.pillClass}`}>{meta.label}</span>
                </motion.div>
              );
            })
          )}
        </div>

        <div className="dash-panel">
          <h2>Active projects</h2>
          {projects.length === 0 ? (
            <p style={{ color: 'var(--text-2)', fontSize: '13px' }}>No projects yet.</p>
          ) : (
            projects.map((proj, i) => {
              const ps = projectStats[proj._id] || { total: 0, done: 0 };
              const pct = ps.total > 0 ? Math.round((ps.done / ps.total) * 100) : 0;
              return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} key={proj._id}>
                  <Link to={`/projects/${proj._id}`} className="proj-item" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                    <div className="proj-item-name">{proj.name}</div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="proj-meta">{pct}% complete</div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
