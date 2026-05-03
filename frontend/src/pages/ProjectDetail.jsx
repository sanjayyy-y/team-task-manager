import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const getInitials = (name) => {
  if (!name) return '?';
  const p = name.split(' ');
  return p.length > 1 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : p[0][0].toUpperCase();
};

const avatarColors = ['#6d5ef8', '#4a9eff', '#3ecf8e', '#f5a623', '#f06060', '#e84393'];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const isGlobalAdmin = user?.role === 'admin';

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskStatus, setTaskStatus] = useState('todo');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');

  // member form
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`),
      ]);
      setProject(projRes.data.data.project);
      setMembers(projRes.data.data.members);
      setTasks(tasksRes.data.data);
    } catch (err) {
      console.error(err);
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
        assignedTo: taskAssignee || null,
        status: taskStatus,
        dueDate: taskDueDate || null,
        priority: taskPriority,
      });
      setShowTaskModal(false);
      setTaskTitle(''); setTaskDesc(''); setTaskAssignee(''); setTaskStatus('todo'); setTaskDueDate(''); setTaskPriority('medium');
      fetchAll();
      toast.success('Task created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail, role: memberRole });
      setMemberEmail('');
      fetchAll();
      toast.success('Member added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      await api.put(`/projects/${id}/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      fetchAll();
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/projects/${id}/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="loading">Loading project...</div>;
  if (!project) return <div className="loading">Project not found</div>;

  const columns = [
    { id: 'todo',        title: 'Todo',        cls: 'col-todo' },
    { id: 'in-progress', title: 'In progress', cls: 'col-progress' },
    { id: 'done',        title: 'Done',        cls: 'col-done' },
  ];

  return (
    <div>
      <div className="project-header">
        <div>
          <div className="breadcrumb"><Link to="/projects">Projects</Link> / <span>{project.name}</span></div>
          <h1 style={{ fontSize: '1.5rem' }}>{project.name}</h1>
        </div>
        <div className="header-actions">
          <div className="member-stack" onClick={() => setShowMemberModal(true)} style={{ cursor: 'pointer' }}>
            {members.slice(0, 4).map((m, i) => (
              <div key={m._id} className="avatar avatar-sm" style={{ background: avatarColors[i % avatarColors.length] }} title={m.userId.name}>
                {getInitials(m.userId.name)}
              </div>
            ))}
          </div>
          {isGlobalAdmin && (
            <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
              <Plus size={16} /> Add task
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className={`kanban-col ${col.cls}`}>
              <div className="col-header">
                <span className="col-title">{col.title}</span>
                <span className="col-count">{colTasks.length}</span>
              </div>
              <div className="task-cards">
                {colTasks.map(task => {
                  const isMyTask = task.assignedTo?._id === user?._id;
                  // admins can do anything, members can only change status on their own tasks
                  const canChangeStatus = isGlobalAdmin || isMyTask;
                  const isDone = task.status === 'done';
                  const assignee = task.assignedTo;
                  const dueStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : null;

                  return (
                    <div key={task._id} className={`kanban-card ${isDone ? 'done-card' : ''}`}>
                      <h4>{task.title}</h4>
                      {task.description && <p>{task.description}</p>}
                      <div className="card-footer">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {assignee && (
                            <div className="avatar avatar-xs" style={{ background: avatarColors[members.findIndex(m => m.userId._id === assignee._id) % avatarColors.length] }}>
                              {getInitials(assignee.name)}
                            </div>
                          )}
                          {canChangeStatus && (
                            <select value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)} className="status-select">
                              <option value="todo">Todo</option>
                              <option value="in-progress">In progress</option>
                              <option value="done">Done</option>
                            </select>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {isDone ? <span className="card-done-label">Completed</span> : dueStr && <span className="card-due">{dueStr}</span>}
                          {isGlobalAdmin && (
                            <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'none', color: 'var(--c-red)', fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: '4px' }} title="Delete task">
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create new task</h2>
              <button className="modal-close" onClick={() => setShowTaskModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Task title</label>
                <input type="text" className="form-input" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="e.g. Build login page" required autoFocus />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} rows="3" placeholder="What needs to be done?" />
              </div>
              <div className="modal-row">
                <div className="form-group">
                  <label>Assign to</label>
                  <select className="form-input" value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)}>
                    <option value="">Unassigned</option>
                    {members.map(m => (
                      <option key={m.userId._id} value={m.userId._id}>{m.userId.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-input" value={taskStatus} onChange={e => setTaskStatus(e.target.value)}>
                    <option value="todo">Todo</option>
                    <option value="in-progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div className="modal-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select className="form-input" value={taskPriority} onChange={e => setTaskPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Due date</label>
                  <input type="date" className="form-input" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Team members</h2>
              <button className="modal-close" onClick={() => setShowMemberModal(false)}>×</button>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              {members.map((m, i) => (
                <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="avatar avatar-sm" style={{ background: avatarColors[i % avatarColors.length] }}>{getInitials(m.userId.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{m.userId.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.userId.email}</div>
                  </div>
                  <span className={`pill ${m.role === 'admin' ? 'pill-green' : 'pill-gray'}`}>{m.role}</span>
                </div>
              ))}
            </div>
            {isGlobalAdmin && (
              <form onSubmit={handleAddMember} style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Invite member</h3>
                <div className="modal-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" className="form-input" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required placeholder="team@company.com" />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select className="form-input" value={memberRole} onChange={e => setMemberRole(e.target.value)}>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowMemberModal(false)}>Close</button>
                  <button type="submit" className="btn btn-primary">Send invite</button>
                </div>
              </form>
            )}
            {!isGlobalAdmin && (
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowMemberModal(false)}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
