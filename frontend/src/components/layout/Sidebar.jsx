import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Projects', path: '/projects', icon: <FolderKanban size={20} /> },
    { name: 'My Tasks', path: '/tasks', icon: <CheckSquare size={20} /> },
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      backgroundColor: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-color)',
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      {links.map((link) => (
        <NavLink
          key={link.name}
          to={link.path}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.875rem 1rem',
            borderRadius: '0.5rem',
            color: isActive ? 'white' : 'var(--text-secondary)',
            backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
            fontWeight: isActive ? '500' : '400',
            transition: 'all 0.2s'
          })}
        >
          {link.icon}
          {link.name}
        </NavLink>
      ))}
    </aside>
  );
}
