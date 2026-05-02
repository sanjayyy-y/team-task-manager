import { useAuth } from '../../hooks/useAuth';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{
      height: 'var(--navbar-height)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      backgroundColor: 'var(--bg-surface)'
    }}>
      <div style={{ fontWeight: '600', fontSize: '1.25rem', color: 'var(--primary-color)' }}>
        TeamTask
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <User size={18} />
          <span>{user?.name}</span>
        </div>
        
        <button 
          onClick={logout}
          style={{
            background: 'none',
            color: 'var(--status-overdue)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
}
