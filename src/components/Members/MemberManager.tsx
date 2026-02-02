import React, { useState } from 'react';
import { HouseholdMember } from '../../types';
import { useMemberContext, DEFAULT_COLORS } from '../../context/MemberContext';
import { useChoreContext } from '../../context/ChoreContext';

interface MemberManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MemberManager({ isOpen, onClose }: MemberManagerProps) {
  const { members, addMember, updateMember, deleteMember } = useMemberContext();
  const { chores } = useChoreContext();
  const [editingMember, setEditingMember] = useState<HouseholdMember | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  if (!isOpen) return null;

  const getNextColor = () => {
    const usedColors = members.map(m => m.color);
    return DEFAULT_COLORS.find(c => !usedColors.includes(c)) || DEFAULT_COLORS[0];
  };

  const resetForm = () => {
    setName('');
    setColor(getNextColor());
    setIsAdmin(false);
    setEditingMember(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingMember) {
      updateMember({ ...editingMember, name: name.trim(), color, isAdmin });
    } else {
      addMember({ name: name.trim(), color, isAdmin });
    }
    resetForm();
  };

  const handleEdit = (member: HouseholdMember) => {
    setEditingMember(member);
    setName(member.name);
    setColor(member.color);
    setIsAdmin(member.isAdmin);
  };

  const handleDelete = (id: string) => {
    const memberChores = chores.filter(c => c.assigneeId === id);
    if (memberChores.length > 0) {
      setShowDeleteConfirm(id);
    } else {
      deleteMember(id);
    }
  };

  const confirmDelete = (id: string) => {
    deleteMember(id);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal member-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Household Members</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="member-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="member-name">Name</label>
                <input
                  id="member-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name..."
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="member-color">Color</label>
                <div className="color-picker">
                  {DEFAULT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-option ${color === c ? 'selected' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
                Administrator
              </label>
            </div>
            <div className="form-actions">
              {editingMember && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
              <button type="submit" className="btn btn-primary">
                {editingMember ? 'Update Member' : 'Add Member'}
              </button>
            </div>
          </form>

          <div className="members-list">
            <h3>Current Members</h3>
            {members.length === 0 ? (
              <p className="empty-text">No members added yet. Add your first household member above.</p>
            ) : (
              <ul>
                {members.map((member) => (
                  <li key={member.id} className="member-list-item">
                    <span
                      className="member-color"
                      style={{ backgroundColor: member.color }}
                    />
                    <span className="member-name">
                      {member.name}
                      {member.isAdmin && <span className="admin-badge">Admin</span>}
                    </span>
                    <div className="member-actions">
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => handleEdit(member)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(member.id)}
                      >
                        Delete
                      </button>
                    </div>
                    {showDeleteConfirm === member.id && (
                      <div className="delete-confirm">
                        <p>This member has assigned chores. Delete anyway?</p>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => confirmDelete(member.id)}
                        >
                          Yes, Delete
                        </button>
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={() => setShowDeleteConfirm(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
