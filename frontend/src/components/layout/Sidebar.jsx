import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { LayoutDashboard, Users, Settings, ChevronRight, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '../ui/Skeleton';

const dotColors = ['#5b9bf5', '#3ddc84', '#f5a623', '#a78bfa', '#f06060', '#5e5ce6'];

const getInitials = (name) => {
  if (!name) return '?';
  const p = name.split(' ');
  return p.length > 1 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : p[0][0].toUpperCase();
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [projects, setProjects] = useState([]);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects')
      .then(res => setProjects(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const projectMatch = location.pathname.match(/^\/projects\/([a-f0-9]+)/);
  const activeProjectId = projectMatch ? projectMatch[1] : null;

  useEffect(() => {
    if (activeProjectId) setProjectsOpen(true);
  }, [activeProjectId]);

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">T</div>
          <span>TeamTask</span>
        </div>
        <div className="sidebar-user">
          <div className="avatar">{getInitials(user?.name)}</div>
          <div style={{ flex: 1 }}>
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{isAdmin ? 'Admin' : 'Member'}</div>
          </div>
          <button onClick={logout} style={{ background: 'none', color: 'var(--text-3)', padding: '4px' }} title="Logout">
            <LogOut size={14} />
          </button>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={16} /> Dashboard
        </NavLink>

        <div
          className="sidebar-section-header"
          onClick={() => setProjectsOpen(!projectsOpen)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ChevronRight size={14} className={`chevron ${projectsOpen ? 'open' : ''}`} />
            Projects
          </div>
        </div>

        <AnimatePresence initial={false}>
          {projectsOpen && (
            <motion.div 
              className="sidebar-projects"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              {loading ? (
                <div style={{ padding: '4px 8px' }}>
                  {[1, 2, 3].map(i => <Skeleton key={i} height="24px" style={{ marginBottom: '6px' }} />)}
                </div>
              ) : (
                projects.map((proj, i) => (
                  <div
                    key={proj._id}
                    className={`sidebar-project-item ${activeProjectId === proj._id ? 'active' : ''}`}
                    onClick={() => navigate(`/projects/${proj._id}`)}
                  >
                    <div className="project-dot" style={{ background: dotColors[i % dotColors.length] }} />
                    {proj.name}
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {isAdmin && (
          <NavLink to="/team" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Users size={16} /> Teams
          </NavLink>
        )}
      </nav>

      <div className="sidebar-bottom">
        <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Settings size={16} /> Settings
        </NavLink>
      </div>
    </aside>
  );
}
