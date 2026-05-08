import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Moon, ShieldPlus, Sun } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const roleCards = [
    {
      value: 'admin',
      label: 'Admin',
      description: 'Manage projects, assign work, and guide the team.',
      icon: ShieldPlus,
    },
    {
      value: 'member',
      label: 'Member',
      description: 'Join the workspace and focus on assigned work.',
      icon: BriefcaseBusiness,
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button className="auth-theme-button" onClick={toggleTheme} type="button" aria-label="Toggle theme">
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="auth-shell auth-shell-refined auth-shell-signup">
        <section className="auth-card auth-card-wide">
          <div className="auth-logo">
            <div className="auth-logo-icon">T</div>
            <span>TeamTask</span>
          </div>

          <div className="auth-card-header">
            <span className="auth-eyebrow">Start organized</span>
            <h2>Create your workspace account</h2>
            <p className="subtitle">Choose your role and step into a cleaner team workflow.</p>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-input auth-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  required
                />
              </div>

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
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-input auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label>Choose role</label>
              <div className="role-options">
                {roleCards.map(({ value, label, description, icon: Icon }) => (
                  <button
                    type="button"
                    key={value}
                    className={`role-card ${role === value ? 'active' : ''}`}
                    onClick={() => setRole(value)}
                  >
                    <div className="role-card-icon">
                      <Icon size={18} />
                    </div>
                    <div>
                      <strong>{label}</strong>
                      <span>{description}</span>
                    </div>
                  </button>
                ))}
              </div>
              <select className="form-input auth-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              <span>{loading ? 'Creating account...' : 'Create account'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </section>

        <section className="auth-preview" aria-label="Workspace preview">
          <div className="auth-preview-top">
            <span>Setup</span>
            <strong>3 steps</strong>
          </div>
          <div className="auth-preview-card primary">
            <div>
              <span className="preview-kicker">Workspace</span>
              <strong>TeamTask Board</strong>
            </div>
            <div className="preview-progress">
              <span style={{ width: '45%' }} />
            </div>
          </div>
          <div className="auth-preview-list">
            {['Create account', 'Choose role', 'Open dashboard'].map((step, index) => (
              <div className="auth-preview-task" key={step}>
                <CheckCircle2 size={16} />
                <span>{step}</span>
                <small>{index === 0 ? 'First' : 'Next'}</small>
              </div>
            ))}
          </div>
          <div className="auth-preview-bottom">
            <div>
              <span>Role access</span>
              <strong>Admin or Member</strong>
            </div>
            <span className="preview-pill">Secure</span>
          </div>
        </section>
      </div>
    </div>
  );
}
