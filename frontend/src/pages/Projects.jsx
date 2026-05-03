import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Plus, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Projects() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/projects', { name, description });
      toast.success('Project created');
      navigate(`/projects/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
      setCreating(false);
    }
  };

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <div className="date">{isAdmin ? "Manage your team's work" : 'Projects you are part of'}</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <h3>No projects yet</h3>
          <p>{isAdmin ? 'Create your first project to start organising tasks.' : 'An admin needs to add you to a project first.'}</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(proj => (
            <Link to={`/projects/${proj._id}`} key={proj._id} className="project-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h3>{proj.name}</h3>
              <p>{proj.description || 'No description provided.'}</p>
              <div className="project-card-footer">
                <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  View Board <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create new project</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name</label>
                <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Website Redesign" required autoFocus />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} rows="3" placeholder="What is this project about?" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
