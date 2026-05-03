import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Plus, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const getInitials = (name) => {
  if (!name) return '?';
  const p = name.split(' ');
  return p.length > 1 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : p[0][0].toUpperCase();
};

const avatarColors = ['#5e5ce6', '#5b9bf5', '#3ddc84', '#f5a623', '#f06060', '#a78bfa'];

export default function Team() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberTasks, setMemberTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // create team modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // add member modal
  const [showAddMember, setShowAddMember] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  // assign task modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');

  useEffect(() => { fetchProjects(); }, []);

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
      setMemberTasks([]);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/projects', { name: teamName, description: teamDesc });
      toast.success('Team created');
      setShowCreateModal(false);
      setTeamName(''); setTeamDesc('');
      await fetchProjects();
      // select the new team
      selectProject(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const openAddMember = async () => {
    setShowAddMember(true);
    try {
      const res = await api.get('/auth/users');
      setAllUsers(res.data.data);
    } catch (err) {
      toast.error('Failed to load users');
    }
  };

  const handleAddUser = async (userToAdd) => {
    if (!activeProject) return;
    // check if already a member
    const exists = members.find(m => m.userId._id === userToAdd._id);
    if (exists) {
      toast.error('Already a member of this team');
      return;
    }
    try {
      await api.post(`/projects/${activeProject._id}/members`, { email: userToAdd.email, role: 'member' });
      toast.success(`${userToAdd.name} added to ${activeProject.name}`);
      selectProject(activeProject);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!selectedMember || !activeProject) return;
    try {
      await api.post(`/projects/${activeProject._id}/tasks`, {
        title: assignTitle, description: assignDesc,
        assignedTo: selectedMember.userId._id, dueDate: assignDueDate || null,
      });
      setShowAssignModal(false);
      setAssignTitle(''); setAssignDesc(''); setAssignDueDate('');
      selectMember(selectedMember);
      toast.success(`Task assigned to ${selectedMember.userId.name}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign');
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
  const isMe = selectedMember?.userId?._id === user?._id;

  // filter users by search
  const memberIds = members.map(m => m.userId._id);
  const filteredUsers = allUsers.filter(u =>
    !memberIds.includes(u._id) &&
    (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Teams</h1>
          <div className="subtitle">
            {activeProject ? `${activeProject.name} · ${members.length} members` : 'Manage your teams and view member tasks'}
          </div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} /> New team
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <h3>No teams yet</h3>
          <p>{isAdmin ? 'Create your first team to start collaborating.' : 'An admin needs to add you to a team.'}</p>
        </div>
      ) : (
        <>
          {/* Team tabs */}
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
            {/* Left: member sidebar */}
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
              {isAdmin && (
                <div
                  style={{ padding: '10px 14px', marginTop: '4px', cursor: 'pointer', color: 'var(--primary)', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={openAddMember}
                >
                  <UserPlus size={14} /> Add member
                </div>
              )}
            </div>

            {/* Right: selected member detail */}
            <div className="team-detail">
              {selectedMember ? (
                <>
                  <div className="team-detail-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="avatar avatar-lg" style={{ background: avatarColors[members.indexOf(selectedMember) % avatarColors.length] }}>
                        {getInitials(selectedMember.userId.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {selectedMember.userId.name}
                          {isMe && <span className="pill pill-blue" style={{ fontSize: '10px' }}>You</span>}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>
                          {selectedMember.role === 'admin' ? 'Admin' : 'Member'} · {activeProject?.name}
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <button className="btn btn-primary" onClick={() => setShowAssignModal(true)}>
                        <Plus size={14} /> Assign task
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

                  {/* Tasks */}
                  <div style={{ marginTop: '20px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Tasks ({memberTasks.length})</h3>
                    {memberTasks.length === 0 ? (
                      <p style={{ color: 'var(--text-2)', fontSize: '13px' }}>No tasks assigned.</p>
                    ) : (
                      memberTasks.map(task => {
                        const meta = statusMeta(task);
                        const dueStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : null;
                        return (
                          <div className="task-row" key={task._id}>
                            <div className="task-dot" style={{ background: meta.dot }} />
                            <div className="task-row-name" style={{ flex: 1 }}>{task.title}</div>
                            {dueStr && <span style={{ fontSize: '12px', color: 'var(--text-2)', marginRight: '8px' }}>{dueStr}</span>}
                            <span className={`pill ${meta.pillClass}`}>{meta.label}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--text-2)', padding: '24px', fontSize: '13px' }}>Select a member to view their tasks.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create new team</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateTeam}>
              <div className="form-group">
                <label>Team name</label>
                <input type="text" className="form-input" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Team Alpha" required autoFocus />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" value={teamDesc} onChange={e => setTeamDesc(e.target.value)} placeholder="What does this team work on?" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create team'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal — pick from registered users */}
      {showAddMember && (
        <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add member to {activeProject?.name}</h2>
              <button className="modal-close" onClick={() => setShowAddMember(false)}>×</button>
            </div>
            <div className="form-group">
              <input
                type="text" className="form-input"
                placeholder="Search by name or email..."
                value={userSearch} onChange={e => setUserSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {filteredUsers.length === 0 ? (
                <p style={{ color: 'var(--text-2)', fontSize: '13px', padding: '12px 0' }}>No users found.</p>
              ) : (
                filteredUsers.map((u, i) => (
                  <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 4px', borderBottom: '1px solid var(--border)' }}>
                    <div className="avatar avatar-sm" style={{ background: avatarColors[i % avatarColors.length] }}>
                      {getInitials(u.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{u.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>{u.email}</div>
                    </div>
                    <button className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={() => handleAddUser(u)}>
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => { setShowAddMember(false); setUserSearch(''); }}>Done</button>
            </div>
          </div>
        </div>
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
                <textarea className="form-input" value={assignDesc} onChange={e => setAssignDesc(e.target.value)} placeholder="What needs to be done?" />
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
