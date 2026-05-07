import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, ShieldPlus, UserRoundPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
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
      <div className="auth-shell auth-shell-signup">
        <section className="auth-card auth-card-wide">
          <div className="auth-logo auth-logo-mobile">
            <div className="auth-logo-icon">T</div>
            <span>TeamTask</span>
          </div>

          <div className="auth-card-header">
            <h2>Create account</h2>
            <p className="subtitle">Set up your workspace access and choose how you want to collaborate</p>
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

        <section className="auth-showcase auth-showcase-compact">
          <div className="auth-logo auth-logo-left">
            <div className="auth-logo-icon">T</div>
            <span>TeamTask</span>
          </div>

          <div className="auth-showcase-copy">
            <div className="auth-badge">
              <UserRoundPlus size={14} />
              <span>Quick team setup</span>
            </div>
            <h1>Create your workspace.</h1>
            <p>Set up your account and start collaborating with a cleaner workflow.</p>
          </div>

          <div className="auth-showcase-metrics">
            <div className="auth-metric-card">
              <strong>Projects</strong>
              <span>Track work in one place</span>
            </div>
            <div className="auth-metric-card">
              <strong>People</strong>
              <span>Assign ownership clearly</span>
            </div>
            <div className="auth-metric-card">
              <strong>Deadlines</strong>
              <span>Keep delivery on schedule</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
