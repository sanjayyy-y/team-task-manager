import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Plus, MoreHorizontal, X, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const getInitials = (name) => {
  if (!name) return '?';
  const p = name.split(' ');
  return p.length > 1 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : p[0][0].toUpperCase();
};

const avatarColors = ['#5e5ce6', '#5b9bf5', '#3ddc84', '#f5a623', '#f06060', '#a78bfa'];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('total');

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

  // compute filter counts
  const myTasks = tasks.filter(t => t.assignedTo?._id === user?._id);
  const inProgress = tasks.filter(t => t.status === 'in-progress');
  const completed = tasks.filter(t => t.status === 'done');
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done');

  const filters = [
    { key: 'total',    label: 'Total tasks',  count: tasks.length,      colorClass: 'fc-white' },
    { key: 'mine',     label: 'My tasks',      count: myTasks.length,    colorClass: 'fc-purple' },
    { key: 'progress', label: 'In progress',   count: inProgress.length, colorClass: 'fc-blue' },
    { key: 'done',     label: 'Completed',     count: completed.length,  colorClass: 'fc-green' },
    { key: 'overdue',  label: 'Overdue',       count: overdue.length,    colorClass: 'fc-red' },
  ];

  // apply the active filter
  const filteredTasks = (() => {
    switch (activeFilter) {
      case 'mine':     return myTasks;
      case 'progress': return inProgress;
      case 'done':     return completed;
      case 'overdue':  return overdue;
      default:         return tasks;
    }
  })();

  const statusMeta = (task) => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
    if (isOverdue) return { dot: 'var(--c-red)', pillClass: 'pill-red', label: 'Overdue' };
    if (task.status === 'done') return { dot: 'var(--c-green)', pillClass: 'pill-green', label: 'Done' };
    if (task.status === 'in-progress') return { dot: 'var(--c-blue)', pillClass: 'pill-blue', label: 'In progress' };
    return { dot: 'var(--c-gray)', pillClass: 'pill-gray', label: 'Todo' };
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { title: taskTitle, description: taskDesc, status: taskStatus, dueDate: taskDueDate || null, priority: taskPriority };
      if (isAdmin) payload.assignedTo = taskAssignee || null;
      await api.post(`/projects/${id}/tasks`, payload);
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

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      await api.put(`/projects/${id}/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      fetchAll();
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  if (loading) return <div className="loading">Loading project...</div>;
  if (!project) return <div className="loading">Project not found</div>;

  const filterLabel = filters.find(f => f.key === activeFilter)?.label || 'All tasks';

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>{project.name}</h1>
          <div className="subtitle">{members.length} members · {tasks.length} tasks</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-ghost" onClick={() => setShowMemberModal(true)}>
            <Users size={14} /> Team
          </button>
          <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
            <Plus size={14} /> Add task
          </button>
        </div>
      </div>

      {/* Filter cards */}
      <div className="filter-cards">
        {filters.map(f => (
          <div
            key={f.key}
            className={`filter-card ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >
            <div className="fc-label">{f.label}</div>
            <div className={`fc-value ${f.colorClass}`}>{f.count}</div>
          </div>
        ))}
      </div>

      {/* Task list */}
      <div className="task-list-header">
        <h2>{filterLabel} <span>({filteredTasks.length})</span></h2>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <h3>No tasks here</h3>
          <p>Try a different filter or add a new task.</p>
        </div>
      ) : (
        filteredTasks.map(task => {
          const meta = statusMeta(task);
          const assignee = task.assignedTo;
          const isMyTask = assignee?._id === user?._id || task.createdBy === user?._id;
          const canEdit = isAdmin || isMyTask;
          const dueStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : null;

          return (
            <div className="task-row" key={task._id}>
              <div className="task-dot" style={{ background: meta.dot }} />
              <div className="task-row-name">{task.title}</div>
              {assignee && (
                <div className="avatar avatar-xs" style={{ background: avatarColors[members.findIndex(m => m.userId._id === assignee._id) % avatarColors.length] }} title={assignee.name}>
                  {getInitials(assignee.name)}
                </div>
              )}
              {dueStr && <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>{dueStr}</span>}
              {canEdit ? (
                <select value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)} className="status-select">
                  <option value="todo">Todo</option>
                  <option value="in-progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              ) : (
                <span className={`pill ${meta.pillClass}`}>{meta.label}</span>
              )}
              {canEdit && (
                <button className="task-menu-btn" onClick={() => handleDeleteTask(task._id)} title="Delete">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          );
        })
      )}

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
                <textarea className="form-input" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="What needs to be done?" />
              </div>
              <div className="modal-row">
                {isAdmin ? (
                  <div className="form-group">
                    <label>Assign to</label>
                    <select className="form-input" value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)}>
                      <option value="">Unassigned</option>
                      {members.map(m => (
                        <option key={m.userId._id} value={m.userId._id}>{m.userId.name} ({m.role})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Assigned to</label>
                    <input type="text" className="form-input" value="You (auto-assigned)" disabled />
                  </div>
                )}
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
            <div style={{ marginBottom: '16px' }}>
              {members.map((m, i) => (
                <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="avatar avatar-sm" style={{ background: avatarColors[i % avatarColors.length] }}>{getInitials(m.userId.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '13px' }}>{m.userId.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>{m.userId.email}</div>
                  </div>
                  <span className={`pill ${m.role === 'admin' ? 'pill-green' : 'pill-gray'}`}>{m.role}</span>
                </div>
              ))}
            </div>
            {isAdmin && (
              <form onSubmit={handleAddMember} style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <h3 style={{ fontSize: '13px', marginBottom: '12px', fontWeight: 600 }}>Invite member</h3>
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
            {!isAdmin && (
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
