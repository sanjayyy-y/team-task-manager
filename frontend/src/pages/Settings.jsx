import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      if (name !== user?.name) payload.name = name;
      if (email !== user?.email) payload.email = email;
      if (password) payload.password = password;

      if (Object.keys(payload).length === 0) {
        toast('Nothing to update');
        setSaving(false);
        return;
      }

      await api.put('/auth/me', payload);
      toast.success('Profile updated. Please log in again.');
      logout();
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      await api.delete('/auth/me');
      toast.success('Account deleted');
      logout();
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <div className="subtitle">Manage your account</div>
        </div>
      </div>

      <div className="settings-card">
        <h2>Appearance</h2>
        <div className="theme-choice-row">
          <button
            type="button"
            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
          >
            <Moon size={16} />
            <div>
              <strong>Dark</strong>
              <span>Low-glare workspace for longer sessions</span>
            </div>
          </button>
          <button
            type="button"
            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
            onClick={() => setTheme('light')}
          >
            <Sun size={16} />
            <div>
              <strong>Light</strong>
              <span>Brighter view with softer contrast</span>
            </div>
          </button>
        </div>
      </div>

      <div className="settings-card">
        <h2>Profile</h2>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>New password (leave blank to keep current)</label>
            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="........" minLength="6" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="settings-card danger-zone">
        <h2 style={{ color: 'var(--c-red)' }}>Danger zone</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '12px' }}>
          Permanently delete your account. This action cannot be undone.
        </p>
        <button className="btn-danger" onClick={handleDelete}>Delete account</button>
      </div>
    </div>
  );
}

