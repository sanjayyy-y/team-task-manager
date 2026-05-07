import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
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
      <div className="auth-shell">
        <section className="auth-showcase">
          <div className="auth-logo auth-logo-left">
            <div className="auth-logo-icon">T</div>
            <span>TeamTask</span>
          </div>

          <div className="auth-showcase-copy">
            <div className="auth-badge">
              <Sparkles size={14} />
              <span>Focused team planning</span>
            </div>
            <h1>Welcome back.</h1>
            <p>Sign in to manage tasks, projects, and team progress in one place.</p>
          </div>

          <div className="auth-showcase-panel">
            <div className="auth-showcase-stat">
              <span>Workspace</span>
              <strong>Clear daily flow</strong>
            </div>
            <div className="auth-showcase-stat">
              <ShieldCheck size={18} />
              <span>Role-based access for admins and members</span>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-logo auth-logo-mobile">
            <div className="auth-logo-icon">T</div>
            <span>TeamTask</span>
          </div>

          <div className="auth-card-header">
            <h2>Sign in</h2>
            <p className="subtitle">Enter your details to access your workspace</p>
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
      </div>
    </div>
  );
}
