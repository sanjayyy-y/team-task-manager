import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Plus, UserPlus, Trash2, X } from 'lucide-react';
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

  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberTasks, setMemberTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const [showAddMember, setShowAddMember] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    if (!isAdmin) return; // shouldn't happen due to sidebar guard, but just in case
    fetchTeams();
  }, [isAdmin]);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams');
      setTeams(res.data.data);
      if (res.data.data.length > 0) {
        selectTeam(res.data.data[0]);
      } else {
        setActiveTeam(null);
        setMembers([]);
        setSelectedMember(null);
        setMemberTasks([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectTeam = async (team) => {
    setActiveTeam(team);
    try {
      const res = await api.get(`/teams/${team._id}`);
      const mems = res.data.data.members;
      setMembers(mems);
      if (mems.length > 0) {
        selectMember(mems[0], team._id);
      } else {
        setSelectedMember(null);
        setMemberTasks([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectMember = async (member) => {
    setSelectedMember(member);
    try {
      // fetch all tasks across all projects for this user
      const res = await api.get(`/teams/user/${member._id}/tasks`);
      setMemberTasks(res.data.data);
    } catch (err) {
      setMemberTasks([]);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/teams', { name: teamName, description: teamDesc });
      toast.success('Team created');
      setShowCreateModal(false);
      setTeamName(''); setTeamDesc('');
      await fetchTeams();
      selectTeam(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!activeTeam) return;
    if (!confirm(`Delete team "${activeTeam.name}"? Members will not be deleted, just removed from this team.`)) return;
    try {
      await api.delete(`/teams/${activeTeam._id}`);
      toast.success('Team deleted');
      fetchTeams();
    } catch (err) {
      toast.error('Failed to delete team');
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
    if (!activeTeam) return;
    const exists = members.find(m => m._id === userToAdd._id);
    if (exists) {
      toast.error('Already a member of this team');
      return;
    }
    try {
      await api.post(`/teams/${activeTeam._id}/members`, { userId: userToAdd._id });
      toast.success(`${userToAdd.name} added to ${activeTeam.name}`);
      selectTeam(activeTeam); // refresh members
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId, userName) => {
    if (!activeTeam) return;
    if (!confirm(`Remove ${userName} from this team?`)) return;
    try {
      await api.delete(`/teams/${activeTeam._id}/members/${userId}`);
      toast.success('Member removed');
      selectTeam(activeTeam);
    } catch (err) {
      toast.error('Failed to remove member');
    }
  };

  const statusMeta = (task) => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
    if (isOverdue) return { dot: 'var(--c-red)', pillClass: 'pill-red', label: 'Overdue' };
    if (task.status === 'done') return { dot: 'var(--c-green)', pillClass: 'pill-green', label: 'Done' };
    if (task.status === 'in-progress') return { dot: 'var(--c-blue)', pillClass: 'pill-blue', label: 'In progress' };
    return { dot: 'var(--c-gray)', pillClass: 'pill-gray', label: 'Todo' };
  };

  if (!isAdmin) {
    return <div className="page-content"><p>Access denied. Teams are for admins only.</p></div>;
  }

  if (loading) return <div className="loading">Loading teams...</div>;

  const completed = memberTasks.filter(t => t.status === 'done').length;
  const pending = memberTasks.length - completed;

  // Search filtering for Add Member modal
  const memberIds = members.map(m => m._id);
  const filteredUsers = allUsers.filter(u =>
    !memberIds.includes(u._id) &&
    (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Teams Directory</h1>
          <div className="subtitle">
            Manage employee groups and view their cross-project tasks
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={14} /> New team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="empty-state">
          <h3>No teams created yet</h3>
          <p>Create your first employee team to start tracking their collective work.</p>
        </div>
      ) : (
        <>
          <div className="team-tabs">
            {teams.map(team => (
              <button
                key={team._id}
                className={`team-tab ${activeTeam?._id === team._id ? 'active' : ''}`}
                onClick={() => selectTeam(team)}
              >
                {team.name}
              </button>
            ))}
          </div>

          <div className="team-layout">
            {/* Left sidebar: Team Members */}
            <div className="team-sidebar">
              <div className="team-sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Team Members · {members.length}</span>
                <button onClick={handleDeleteTeam} title="Delete Team" style={{ background: 'none', color: 'var(--text-3)' }}><Trash2 size={13} /></button>
              </div>

              {members.length === 0 ? (
                <div style={{ padding: '20px 14px', color: 'var(--text-2)', fontSize: '12px' }}>This team has no members yet.</div>
              ) : (
                members.map((m, i) => (
                  <div
                    key={m._id}
                    className={`team-member-item ${selectedMember?._id === m._id ? 'active' : ''}`}
                    onClick={() => selectMember(m)}
                    style={{ position: 'relative' }}
                  >
                    <div className="avatar avatar-sm" style={{ background: avatarColors[i % avatarColors.length] }}>
                      {getInitials(m.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="team-member-name">{m.name}</div>
                      <div className="team-member-role">{m.role === 'admin' ? 'Admin' : 'Member'}</div>
                    </div>
                    {/* remove member btn on hover */}
                    {selectedMember?._id === m._id && m._id !== user._id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveMember(m._id, m.name); }}
                        style={{ background: 'none', color: 'var(--c-red)', padding: '4px' }}
                        title="Remove from team"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}

              <div
                style={{ padding: '10px 14px', marginTop: '4px', cursor: 'pointer', color: 'var(--primary)', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={openAddMember}
              >
                <UserPlus size={14} /> Add team member
              </div>
            </div>

            {/* Right: Selected Member's Tasks */}
            <div className="team-detail">
              {selectedMember ? (
                <>
                  <div className="team-detail-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="avatar avatar-lg" style={{ background: avatarColors[members.indexOf(selectedMember) % avatarColors.length] }}>
                        {getInitials(selectedMember.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '15px' }}>{selectedMember.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>
                          {selectedMember.email} · {selectedMember.role}
                        </div>
                      </div>
                    </div>
                  </div>

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

                  <div style={{ marginTop: '20px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Active Tasks ({memberTasks.length})</h3>
                    {memberTasks.length === 0 ? (
                      <p style={{ color: 'var(--text-2)', fontSize: '13px' }}>No active tasks across any projects.</p>
                    ) : (
                      memberTasks.map(task => {
                        const meta = statusMeta(task);
                        const dueStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : null;
                        return (
                          <div className="task-row" key={task._id}>
                            <div className="task-dot" style={{ background: meta.dot }} />
                            <div className="task-row-name" style={{ flex: 1 }}>
                              {task.title}
                              <div style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '2px' }}>Project: {task.projectId?.name || 'Unknown'}</div>
                            </div>
                            {dueStr && <span style={{ fontSize: '12px', color: 'var(--text-2)', marginRight: '8px' }}>{dueStr}</span>}
                            <span className={`pill ${meta.pillClass}`}>{meta.label}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--text-2)', padding: '24px', fontSize: '13px' }}>Select a team member to view their overall workload.</p>
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
              <h2>Create Employee Team</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateTeam}>
              <div className="form-group">
                <label>Team name</label>
                <input type="text" className="form-input" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Engineering, Marketing" required autoFocus />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" value={teamDesc} onChange={e => setTeamDesc(e.target.value)} placeholder="What is this team's purpose?" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create team'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal-overlay" onClick={() => setShowAddMember(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add employee to {activeTeam?.name}</h2>
              <button className="modal-close" onClick={() => setShowAddMember(false)}>×</button>
            </div>
            <div className="form-group">
              <input
                type="text" className="form-input"
                placeholder="Search registered users..."
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
                      Add to team
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
    </div>
  );
}

