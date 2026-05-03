import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

const getInitials = (name) => {
  if (!name) return '?';
  const p = name.split(' ');
  return p.length > 1 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : p[0][0].toUpperCase();
};

const avatarColors = ['#5e5ce6', '#5b9bf5', '#3ddc84', '#f5a623', '#f06060', '#a78bfa'];

const TaskRow = React.memo(({
  task,
  delay = 0,
  canEdit = false,
  members = [],
  onStatusChange,
  onDelete
}) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  const meta = isOverdue
    ? { dot: 'var(--c-red)', pillClass: 'pill-red', label: 'Overdue' }
    : task.status === 'done'
      ? { dot: 'var(--c-green)', pillClass: 'pill-green', label: 'Done' }
      : task.status === 'in-progress'
        ? { dot: 'var(--c-blue)', pillClass: 'pill-blue', label: 'In progress' }
        : { dot: 'var(--c-gray)', pillClass: 'pill-gray', label: 'Todo' };

  const assignee = task.assignedTo;
  const dueStr = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="task-row"
    >
      <div className="task-dot" style={{ background: meta.dot }} />
      
      <div className="task-row-name">
        {task.title}
        {task.projectId && task.projectId.name && (
          <div style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '2px' }}>
            Project: {task.projectId.name}
          </div>
        )}
      </div>

      {assignee && members.length > 0 && (
        <div
          className="avatar avatar-xs"
          style={{ background: avatarColors[members.findIndex(m => m.userId?._id === assignee._id || m._id === assignee._id) % avatarColors.length] || avatarColors[0] }}
          title={assignee.name}
        >
          {getInitials(assignee.name)}
        </div>
      )}

      {dueStr && <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>{dueStr}</span>}

      {canEdit ? (
        <select
          value={task.status}
          onChange={e => onStatusChange(task._id, e.target.value)}
          className="status-select"
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>
      ) : (
        <span className={`pill ${meta.pillClass}`}>{meta.label}</span>
      )}

      {canEdit && onDelete && (
        <button className="task-menu-btn" onClick={() => onDelete(task)} title="Delete task">
          <Trash2 size={13} />
        </button>
      )}
    </motion.div>
  );
});

export default TaskRow;
