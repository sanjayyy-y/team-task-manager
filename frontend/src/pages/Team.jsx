import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

const getInitials = (name) => {
  if (!name) return '?';
  const p = name.split(' ');
  return p.length > 1 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : p[0][0].toUpperCase();
};

const avatarColors = ['#6d5ef8', '#4a9eff', '#3ecf8e', '#f5a623', '#f06060', '#e84393'];

export default function Team() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      // for each project, fetch its members
      const withMembers = await Promise.all(
        res.data.data.map(async (proj) => {
          const detail = await api.get(`/projects/${proj._id}`);
          return { ...proj, members: detail.data.data.members };
        })
      );
      setProjects(withMembers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading team...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Team</h1>
          <div className="date">Members across your projects</div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <h3>No projects yet</h3>
          <p>Create a project first, then invite your team.</p>
        </div>
      ) : (
        projects.map((proj) => (
          <div key={proj._id} className="dash-panel" style={{ marginBottom: '1.25rem' }}>
            <h2>{proj.name}</h2>
            {proj.members.map((m, i) => (
              <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                <div className="avatar avatar-sm" style={{ background: avatarColors[i % avatarColors.length] }}>
                  {getInitials(m.userId.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{m.userId.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.userId.email}</div>
                </div>
                <span className={`pill ${m.role === 'admin' ? 'pill-green' : 'pill-gray'}`}>{m.role}</span>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
