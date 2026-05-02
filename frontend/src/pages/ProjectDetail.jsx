import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Plus, Users, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // check if current user is an admin
  const isAdmin = members.find(m => m.userId?._id === user?._id)?.role === 'admin';

  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  
  // Task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  
  // Member form
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`)
      ]);
      
      setProject(projRes.data.data.project);
      setMembers(projRes.data.data.members);
      setTasks(tasksRes.data.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/tasks`, {
        title: taskTitle,
        description: taskDesc,
        assignedTo: taskAssignee || null
      });
      setShowTaskModal(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskAssignee('');
      fetchProjectData(); // refresh board
      toast.success('Task created');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, {
        email: memberEmail,
        role: memberRole
      });
      setShowMemberModal(false);
      setMemberEmail('');
      fetchProjectData();
      toast.success('Member invited');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  // Move task to a different status
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // optimistic update for snappy UI
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      await api.put(`/projects/${id}/tasks/${taskId}`, { status: newStatus });
    } catch (error) {
      // revert on failure
      fetchProjectData();
      toast.error(error.response?.data?.message || 'Failed to update task');
    }
  };

  if (loading) return <div className="loading-screen">Loading project...</div>;
  if (!project) return <div className="loading-screen">Project not found</div>;

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ];

  return (
    <div className="project-detail">
      <div className="project-header">
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>{project.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={() => setShowMemberModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} />
            Team ({members.length})
          </button>
          
          {isAdmin && (
            <button className="btn-primary" onClick={() => setShowTaskModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} />
              New Task
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {columns.map(col => (
          <div key={col.id} className="kanban-column glass">
            <h3 className="column-title">
              {col.title} 
              <span className="task-count">{tasks.filter(t => t.status === col.id).length}</span>
            </h3>
            
            <div className="task-container">
              {tasks.filter(t => t.status === col.id).map(task => {
                const canEdit = isAdmin || task.assignedTo?._id === user?._id;
                
                return (
                  <div key={task._id} className="kanban-card">
                    <h4>{task.title}</h4>
                    {task.description && <p>{task.description}</p>}
                    
                    <div className="card-footer">
                      <div className="assignee">
                        {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                      </div>
                      
                      {canEdit && (
                        <select 
                          value={task.status} 
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          className="status-select"
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <h2>Create Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" className="form-input" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required autoFocus />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} rows="3" />
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select className="form-input" value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)}>
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.userId._id} value={m.userId._id}>{m.userId.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <h2>Manage Team</h2>
            
            <div className="members-list" style={{ marginBottom: '2rem' }}>
              {members.map(m => (
                <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{m.userId.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{m.userId.email}</div>
                  </div>
                  <div className={`status-badge ${m.role === 'admin' ? 'status-done' : 'status-todo'}`}>
                    {m.role}
                  </div>
                </div>
              ))}
            </div>

            {isAdmin && (
              <form onSubmit={handleAddMember} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Invite Member</h3>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="form-input" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select className="form-input" value={memberRole} onChange={e => setMemberRole(e.target.value)}>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowMemberModal(false)}>Close</button>
                  <button type="submit" className="btn-primary">Send Invite</button>
                </div>
              </form>
            )}
            {!isAdmin && (
              <button className="btn-secondary" onClick={() => setShowMemberModal(false)} style={{ width: '100%' }}>Close</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
