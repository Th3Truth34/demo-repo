import { useState, useEffect } from 'react';
import { Chore, RecurrencePattern } from '../../types';
import { useChoreContext } from '../../context/ChoreContext';
import { useAuthContext } from '../../context/AuthContext';
import { MemberSelect } from '../Members/MemberSelect';
import { formatDate } from '../../utils/dateUtils';

interface ChoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  editChore?: Chore | null;
  initialDate?: string;
}

const CATEGORIES: { value: Chore['category']; label: string }[] = [
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'other', label: 'Other' },
];

const FREQUENCIES: { value: RecurrencePattern['frequency']; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export function ChoreModal({ isOpen, onClose, editChore, initialDate }: ChoreModalProps) {
  const { addChore, updateChore, deleteChore } = useChoreContext();
  const { currentUser, canEditChore, canDeleteChore } = useAuthContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState(formatDate(new Date()));
  const [category, setCategory] = useState<Chore['category']>('other');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<RecurrencePattern['frequency']>('weekly');
  const [endDate, setEndDate] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (editChore) {
      setTitle(editChore.title);
      setDescription(editChore.description || '');
      setAssigneeId(editChore.assigneeId);
      setDueDate(editChore.dueDate);
      setCategory(editChore.category);
      setIsRecurring(!!editChore.recurrence);
      if (editChore.recurrence) {
        setFrequency(editChore.recurrence.frequency);
        setEndDate(editChore.recurrence.endDate || '');
      }
    } else {
      resetForm();
      if (initialDate) {
        setDueDate(initialDate);
      }
      if (currentUser) {
        setAssigneeId(currentUser.id);
      }
    }
  }, [editChore, initialDate, currentUser, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAssigneeId(currentUser?.id || '');
    setDueDate(formatDate(new Date()));
    setCategory('other');
    setIsRecurring(false);
    setFrequency('weekly');
    setEndDate('');
    setShowDeleteConfirm(false);
  };

  if (!isOpen) return null;

  const canEdit = !editChore || canEditChore(editChore.assigneeId);
  const canDelete = editChore && canDeleteChore(editChore.assigneeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assigneeId || !canEdit) return;

    const choreData: Omit<Chore, 'id'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      assigneeId,
      dueDate,
      category,
      completed: editChore?.completed || false,
      completedDate: editChore?.completedDate,
      recurrence: isRecurring
        ? { frequency, endDate: endDate || undefined }
        : null,
    };

    if (editChore) {
      updateChore({ ...choreData, id: editChore.id });
    } else {
      addChore(choreData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (editChore && canDelete) {
      deleteChore(editChore.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal chore-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editChore ? 'Edit Chore' : 'Add New Chore'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="chore-title">Title *</label>
            <input
              id="chore-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter chore title..."
              required
              disabled={!canEdit}
            />
          </div>

          <div className="form-group">
            <label htmlFor="chore-description">Description</label>
            <textarea
              id="chore-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
              disabled={!canEdit}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="chore-assignee">Assignee *</label>
              <MemberSelect
                id="chore-assignee"
                value={assigneeId}
                onChange={setAssigneeId}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="chore-category">Category</label>
              <select
                id="chore-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Chore['category'])}
                disabled={!canEdit}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="chore-due-date">Due Date *</label>
            <input
              id="chore-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              disabled={!canEdit}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                disabled={!canEdit}
              />
              Recurring chore
            </label>
          </div>

          {isRecurring && (
            <div className="recurrence-options">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="chore-frequency">Frequency</label>
                  <select
                    id="chore-frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as RecurrencePattern['frequency'])}
                    disabled={!canEdit}
                  >
                    {FREQUENCIES.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="chore-end-date">End Date (optional)</label>
                  <input
                    id="chore-end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={dueDate}
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </div>
          )}

          {!canEdit && (
            <p className="permission-warning">
              You don't have permission to edit this chore.
            </p>
          )}

          <div className="modal-footer">
            {editChore && canDelete && (
              <>
                {showDeleteConfirm ? (
                  <div className="delete-confirm-inline">
                    <span>Delete this chore?</span>
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={handleDelete}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-small"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete
                  </button>
                )}
              </>
            )}
            <div className="modal-footer-right">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              {canEdit && (
                <button type="submit" className="btn btn-primary">
                  {editChore ? 'Save Changes' : 'Add Chore'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
