import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { LayoutDashboard, Users, Settings, ChevronRight, LogOut } from 'lucide-react';

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

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data.data)).catch(() => {});
  }, []);

  // figure out if we're currently on a project page
  const projectMatch = location.pathname.match(/^\/projects\/([a-f0-9]+)/);
  const activeProjectId = projectMatch ? projectMatch[1] : null;

  // auto-expand if we land on a project page
  useEffect(() => {
    if (activeProjectId) setProjectsOpen(true);
  }, [activeProjectId]);

  return (
    <aside className="sidebar">
      {/* top: logo + user */}
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

      {/* nav */}
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={16} /> Dashboard
        </NavLink>

        {/* Projects — expandable */}
        <div
          className="sidebar-section-header"
          onClick={() => setProjectsOpen(!projectsOpen)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ChevronRight size={14} className={`chevron ${projectsOpen ? 'open' : ''}`} />
            Projects
          </div>
        </div>

        {projectsOpen && (
          <div className="sidebar-projects">
            {projects.map((proj, i) => (
              <div
                key={proj._id}
                className={`sidebar-project-item ${activeProjectId === proj._id ? 'active' : ''}`}
                onClick={() => navigate(`/projects/${proj._id}`)}
              >
                <div className="project-dot" style={{ background: dotColors[i % dotColors.length] }} />
                {proj.name}
              </div>
            ))}
          </div>
        )}

        {isAdmin && (
          <NavLink to="/team" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Users size={16} /> Teams
          </NavLink>
        )}
      </nav>

      {/* bottom: settings */}
      <div className="sidebar-bottom">
        <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Settings size={16} /> Settings
        </NavLink>
      </div>
    </aside>
  );
}
