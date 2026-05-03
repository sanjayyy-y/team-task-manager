import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Plus, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '../components/ui/Skeleton';
import TaskRow from '../components/ui/TaskRow';

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

  const filteredTasks = (() => {
    switch (activeFilter) {
      case 'mine':     return myTasks;
      case 'progress': return inProgress;
      case 'done':     return completed;
      case 'overdue':  return overdue;
      default:         return tasks;
    }
  })();

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

  const handleStatusChange = async (taskId, newStatus) => {
    const originalTasks = [...tasks];
    try {
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      await api.put(`/projects/${id}/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      setTasks(originalTasks);
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDeleteTaskWithUndo = (taskToDelete) => {
    const originalTasks = [...tasks];
    setTasks(tasks.filter(t => t._id !== taskToDelete._id));

    toast.custom((t) => (
      <div className={`toast-undo ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
        <span>Deleting task...</span>
        <button onClick={() => { 
          toast.dismiss(t.id); 
          setTasks(originalTasks);
          clearTimeout(window[`delete_task_${taskToDelete._id}`]);
        }}>Undo</button>
      </div>
    ), { id: `delete_${taskToDelete._id}`, duration: 5000 });

    window[`delete_task_${taskToDelete._id}`] = setTimeout(async () => {
      try {
        await api.delete(`/projects/${id}/tasks/${taskToDelete._id}`);
      } catch (err) {
        setTasks(originalTasks);
        toast.error('Failed to delete task');
      }
    }, 5000);
  };

  const handleDeleteProjectWithUndo = () => {
    if (!isAdmin) return;
    toast.custom((t) => (
      <div className={`toast-undo ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
        <span>Deleting project "{project.name}"...</span>
        <button onClick={() => { 
          toast.dismiss(t.id); 
          clearTimeout(window[`delete_proj_${id}`]);
        }}>Undo</button>
      </div>
    ), { id: `delete_proj_${id}`, duration: 5000 });

    window[`delete_proj_${id}`] = setTimeout(async () => {
      try {
        await api.delete(`/projects/${id}`);
        toast.success('Project deleted');
        window.location.href = '/'; 
      } catch (err) {
        toast.error('Failed to delete project');
      }
    }, 5000);
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <div className="page-header">
          <div>
            <Skeleton width="180px" height="32px" style={{ marginBottom: '8px' }} />
            <Skeleton width="120px" height="16px" />
          </div>
        </div>
        <div className="filter-cards">
          {[1, 2, 3, 4, 5].map(i => (
            <div className="filter-card" key={i}>
              <Skeleton width="60px" height="14px" style={{ marginBottom: '6px' }} />
              <Skeleton width="30px" height="28px" />
            </div>
          ))}
        </div>
        <Skeleton width="150px" height="20px" style={{ marginBottom: '16px' }} />
        {[1, 2, 3].map(i => <Skeleton key={i} height="48px" style={{ marginBottom: '8px' }} />)}
      </motion.div>
    );
  }

  if (!project) return <div className="loading">Project not found</div>;

  const filterLabel = filters.find(f => f.key === activeFilter)?.label || 'All tasks';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} key={id}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>{project.name}</h1>
          <div className="subtitle">{members.length} members · {tasks.length} tasks</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isAdmin && (
            <button className="btn btn-ghost" onClick={handleDeleteProjectWithUndo} title="Delete Project">
              <Trash2 size={14} style={{ color: 'var(--c-red)' }} />
            </button>
          )}
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
          <motion.div
            key={f.key}
            whileTap={{ scale: 0.97 }}
            className={`filter-card ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >
            <div className="fc-label">{f.label}</div>
            <div className={`fc-value ${f.colorClass}`}>{f.count}</div>
          </motion.div>
        ))}
      </div>

      {/* Task list */}
      <div className="task-list-header">
        <h2>{filterLabel} <span>({filteredTasks.length})</span></h2>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          {activeFilter === 'overdue' && <h3>No overdue tasks 🎉</h3>}
          {activeFilter === 'progress' && <h3>No tasks in progress</h3>}
          {activeFilter === 'done' && <h3>No completed tasks yet</h3>}
          {activeFilter === 'mine' && <h3>You have no tasks here</h3>}
          {activeFilter === 'total' && <h3>No tasks in this project</h3>}
          <p>Try a different filter or add a new task.</p>
        </div>
      ) : (
        filteredTasks.map((task, i) => {
          const isMyTask = task.assignedTo?._id === user?._id || task.createdBy === user?._id;
          const canEdit = isAdmin || isMyTask;

          return (
            <TaskRow 
              key={task._id} 
              task={task} 
              delay={i * 0.03} 
              canEdit={canEdit} 
              members={members} 
              onStatusChange={handleStatusChange} 
              onDelete={handleDeleteTaskWithUndo} 
            />
          );
        })
      )}

      {/* Create Task Modal */}
      <AnimatePresence>
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            className="modal" onClick={e => e.stopPropagation()}
          >
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
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Member Modal */}
      <AnimatePresence>
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            className="modal" onClick={e => e.stopPropagation()}
          >
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
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
