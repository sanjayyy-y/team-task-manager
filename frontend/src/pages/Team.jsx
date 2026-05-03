import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const getInitials = (name) => {
  if (!name) return '?';
  const p = name.split(' ');
  return p.length > 1 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : p[0][0].toUpperCase();
};

const avatarColors = ['#6d5ef8', '#4a9eff', '#3ecf8e', '#f5a623', '#f06060', '#e84393'];

export default function Team() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberTasks, setMemberTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // assign task modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
      if (res.data.data.length > 0) {
        selectProject(res.data.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectProject = async (project) => {
    setActiveProject(project);
    try {
      const res = await api.get(`/projects/${project._id}`);
      const mems = res.data.data.members;
      setMembers(mems);
      // auto-select the first member
      if (mems.length > 0) {
        selectMember(mems[0], project._id);
      } else {
        setSelectedMember(null);
        setMemberTasks([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectMember = async (member, projectId) => {
    setSelectedMember(member);
    const pid = projectId || activeProject?._id;
    try {
      const res = await api.get(`/projects/${pid}/tasks?assignedTo=${member.userId._id}`);
      setMemberTasks(res.data.data);
    } catch (err) {
      console.error(err);
      setMemberTasks([]);
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!selectedMember || !activeProject) return;
    try {
      await api.post(`/projects/${activeProject._id}/tasks`, {
        title: assignTitle,
        description: assignDesc,
        assignedTo: selectedMember.userId._id,
        dueDate: assignDueDate || null,
      });
      setShowAssignModal(false);
      setAssignTitle(''); setAssignDesc(''); setAssignDueDate('');
      selectMember(selectedMember);
      toast.success(`Task assigned to ${selectedMember.userId.name}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign task');
    }
  };

  const statusMeta = (task) => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
    if (isOverdue) return { dot: 'var(--c-red)', pillClass: 'pill-red', label: 'Overdue' };
    if (task.status === 'done') return { dot: 'var(--c-green)', pillClass: 'pill-green', label: 'Done' };
    if (task.status === 'in-progress') return { dot: 'var(--c-blue)', pillClass: 'pill-blue', label: 'In progress' };
    return { dot: 'var(--c-gray)', pillClass: 'pill-gray', label: 'Todo' };
  };

  if (loading) return <div className="loading">Loading teams...</div>;

  const completed = memberTasks.filter(t => t.status === 'done').length;
  const pending = memberTasks.length - completed;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Teams</h1>
          <div className="date">Manage your teams and view member tasks</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => window.location.href = '/projects'}>
            <Plus size={16} /> New team
          </button>
        )}
      </div>

      {/* Team tabs */}
      {projects.length === 0 ? (
        <div className="empty-state">
          <h3>No teams yet</h3>
          <p>{isAdmin ? 'Create a project to get started.' : 'An admin needs to add you to a project.'}</p>
        </div>
      ) : (
        <>
          <div className="team-tabs">
            {projects.map(proj => (
              <button
                key={proj._id}
                className={`team-tab ${activeProject?._id === proj._id ? 'active' : ''}`}
                onClick={() => selectProject(proj)}
              >
                {proj.name}
              </button>
            ))}
          </div>

          <div className="team-layout">
            {/* Left: Member sidebar */}
            <div className="team-sidebar">
              <div className="team-sidebar-header">Members · {members.length}</div>
              {members.map((m, i) => (
                <div
                  key={m._id}
                  className={`team-member-item ${selectedMember?._id === m._id ? 'active' : ''}`}
                  onClick={() => selectMember(m)}
                >
                  <div className="avatar avatar-sm" style={{ background: avatarColors[i % avatarColors.length] }}>
                    {getInitials(m.userId.name)}
                  </div>
                  <div>
                    <div className="team-member-name">{m.userId.name}</div>
                    <div className="team-member-role">{m.role === 'admin' ? 'Admin' : 'Member'}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Selected member's detail */}
            <div className="team-detail">
              {selectedMember ? (
                <>
                  {/* Member header */}
                  <div className="team-detail-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="avatar" style={{ width: 44, height: 44, fontSize: '0.95rem', background: avatarColors[members.indexOf(selectedMember) % avatarColors.length] }}>
                        {getInitials(selectedMember.userId.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedMember.userId.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {selectedMember.role === 'admin' ? 'Admin' : 'Member'} · {activeProject?.name}
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <button className="btn btn-primary" onClick={() => setShowAssignModal(true)}>
                        <Plus size={16} /> Assign task
                      </button>
                    )}
                  </div>

                  {/* Mini stats */}
                  <div className="team-stats">
                    <div className="team-stat-card">
                      <div className="label">Total tasks</div>
                      <div className="value value-white">{memberTasks.length}</div>
                    </div>
                    <div className="team-stat-card">
                      <div className="label">Completed</div>
                      <div className="value value-green">{completed}</div>
                    </div>
                    <div className="team-stat-card">
                      <div className="label">Pending</div>
                      <div className="value value-blue">{pending}</div>
                    </div>
                  </div>

                  {/* Task list */}
                  <div style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Tasks</h3>
                    {memberTasks.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No tasks assigned to this member.</p>
                    ) : (
                      memberTasks.map(task => {
                        const meta = statusMeta(task);
                        const dueStr = task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
                          : null;
                        return (
                          <div className="task-row" key={task._id}>
                            <div className="task-dot" style={{ background: meta.dot }} />
                            <div className="task-row-name" style={{ flex: 1 }}>{task.title}</div>
                            {dueStr && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.75rem' }}>{dueStr}</span>}
                            <span className={`pill ${meta.pillClass}`}>{meta.label}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>Select a member to view their tasks.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Assign Task Modal */}
      {showAssignModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign task to {selectedMember.userId.name}</h2>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            <form onSubmit={handleAssignTask}>
              <div className="form-group">
                <label>Task title</label>
                <input type="text" className="form-input" value={assignTitle} onChange={e => setAssignTitle(e.target.value)} placeholder="e.g. Review PR" required autoFocus />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" value={assignDesc} onChange={e => setAssignDesc(e.target.value)} rows="3" placeholder="What needs to be done?" />
              </div>
              <div className="form-group">
                <label>Due date</label>
                <input type="date" className="form-input" value={assignDueDate} onChange={e => setAssignDueDate(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Assign task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
