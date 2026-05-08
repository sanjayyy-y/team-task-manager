import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Moon, Sun } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button className="auth-theme-button" onClick={toggleTheme} type="button" aria-label="Toggle theme">
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="auth-shell auth-shell-refined">
        <section className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">T</div>
            <span>TeamTask</span>
          </div>

          <div className="auth-card-header">
            <span className="auth-eyebrow">Welcome back</span>
            <h2>Sign in to your workspace</h2>
            <p className="subtitle">Review tasks, project progress, and team updates from one focused place.</p>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-input auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-input auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="........"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              <span>{loading ? 'Signing in...' : 'Sign in'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="auth-link">
            Don&apos;t have an account? <Link to="/signup">Create one</Link>
          </div>

          <div className="auth-footer">
            Role access is assigned when the account is created.
          </div>
        </section>

        <section className="auth-preview" aria-label="Workspace preview">
          <div className="auth-preview-top">
            <span>Today</span>
            <strong>4 priorities</strong>
          </div>
          <div className="auth-preview-card primary">
            <div>
              <span className="preview-kicker">Project</span>
              <strong>Website Launch</strong>
            </div>
            <div className="preview-progress">
              <span style={{ width: '72%' }} />
            </div>
          </div>
          <div className="auth-preview-list">
            {['Finalize login flow', 'Review team tasks', 'Prepare sprint notes'].map((task, index) => (
              <div className="auth-preview-task" key={task}>
                <CheckCircle2 size={16} />
                <span>{task}</span>
                <small>{index === 0 ? 'Now' : 'Next'}</small>
              </div>
            ))}
          </div>
          <div className="auth-preview-bottom">
            <div>
              <span>Team focus</span>
              <strong>On track</strong>
            </div>
            <div className="preview-avatars">
              <span>SA</span>
              <span>PM</span>
              <span>RK</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
