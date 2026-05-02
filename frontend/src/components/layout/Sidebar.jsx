import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, LogOut } from 'lucide-react';

// grab initials from a full name
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase();
};

export default function Sidebar() {
  const { user, logout } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/',         icon: <LayoutDashboard size={18} /> },
    { name: 'Projects',  path: '/projects',  icon: <FolderKanban size={18} /> },
    { name: 'My Tasks',  path: '/tasks',     icon: <CheckSquare size={18} /> },
    { name: 'Team',      path: '/team',      icon: <Users size={18} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">T</div>
        <span>TeamTask</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.path === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {link.icon}
            {link.name}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="avatar">{getInitials(user?.name)}</div>
        <div style={{ flex: 1 }}>
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-role">Admin</div>
        </div>
        <button onClick={logout} style={{ background: 'none', color: 'var(--text-muted)' }} title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
