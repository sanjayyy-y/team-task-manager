import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, ArrowRight } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Create project form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      const res = await api.post('/projects', { name, description });
      // Go straight to the new project board
      navigate(`/projects/${res.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
      setCreating(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading projects...</div>;

  return (
    <div className="projects-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Your Projects</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your team's work</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowModal(true)}>
          <Plus size={18} />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state glass">
          <h3>No projects yet</h3>
          <p>Create your first project to start organizing tasks.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <Link to={`/projects/${project._id}`} key={project._id} className="project-card glass">
              <h3>{project.name}</h3>
              <p>{project.description || 'No description provided.'}</p>
              <div className="project-card-footer">
                <span>View Board</span>
                <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Simple Modal for creating a project */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <h2>Create New Project</h2>
            {error && <div style={{ color: 'var(--status-overdue)', margin: '1rem 0' }}>{error}</div>}
            
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="e.g., Website Redesign"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea 
                  className="form-input" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows="3"
                  placeholder="What is this project about?"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
