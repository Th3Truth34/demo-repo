import { useState, useMemo } from 'react';
import { Chore } from '../../types';
import { useChoreContext } from '../../context/ChoreContext';
import { useMemberContext } from '../../context/MemberContext';
import { useAuthContext } from '../../context/AuthContext';
import { formatDisplayDate, parseDate, isPast } from '../../utils/dateUtils';
import { getFrequencyLabel, expandAllChores, ExpandedChoreEvent } from '../../utils/recurrenceUtils';
import { addMonths } from '../../utils/dateUtils';

interface ChoreListProps {
  onEditChore: (chore: Chore) => void;
}

type FilterType = 'all' | 'pending' | 'completed' | 'mine' | 'overdue';
type SortType = 'dueDate' | 'assignee' | 'category';

export function ChoreList({ onEditChore }: ChoreListProps) {
  const { chores, completions, completeChore, completeInstance } = useChoreContext();
  const { getMemberById } = useMemberContext();
  const { currentUser } = useAuthContext();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('dueDate');

  const expandedChores = useMemo(() => {
    const now = new Date();
    const rangeStart = addMonths(now, -1);
    const rangeEnd = addMonths(now, 3);
    return expandAllChores(chores, rangeStart, rangeEnd, completions);
  }, [chores, completions]);

  const filteredChores = expandedChores.filter((event) => {
    switch (filter) {
      case 'pending':
        return !event.completed;
      case 'completed':
        return event.completed;
      case 'mine':
        return currentUser && event.assigneeId === currentUser.id;
      case 'overdue':
        return !event.completed && isPast(parseDate(event.date));
      default:
        return true;
    }
  });

  const sortedChores = [...filteredChores].sort((a, b) => {
    switch (sort) {
      case 'dueDate':
        return a.date.localeCompare(b.date);
      case 'assignee':
        const memberA = getMemberById(a.assigneeId);
        const memberB = getMemberById(b.assigneeId);
        return (memberA?.name || '').localeCompare(memberB?.name || '');
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  const handleCompleteToggle = (event: ExpandedChoreEvent, checked: boolean) => {
    if (event.isRecurring) {
      completeInstance(event.choreId, event.date, currentUser?.id || '', checked);
    } else {
      completeChore(event.choreId, checked);
    }
  };

  const getCategoryIcon = (category: Chore['category']) => {
    const icons: Record<Chore['category'], string> = {
      cleaning: '🧹',
      maintenance: '🔧',
      outdoor: '🌿',
      kitchen: '🍳',
      other: '📦',
    };
    return icons[category];
  };

  return (
    <div className="chore-list-container">
      <div className="list-controls">
        <div className="filter-group">
          <label>Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value as FilterType)}>
            <option value="all">All Chores</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            {currentUser && <option value="mine">My Chores</option>}
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div className="sort-group">
          <label>Sort by:</label>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortType)}>
            <option value="dueDate">Due Date</option>
            <option value="assignee">Assignee</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {sortedChores.length === 0 ? (
        <div className="empty-state">
          <p>No chores found.</p>
          {filter !== 'all' && (
            <button className="btn btn-link" onClick={() => setFilter('all')}>
              Show all chores
            </button>
          )}
        </div>
      ) : (
        <ul className="chore-list">
          {sortedChores.map((event) => {
            const member = getMemberById(event.assigneeId);
            const isOverdue = !event.completed && isPast(parseDate(event.date));
            const chore = event.originalChore;

            return (
              <li
                key={event.id}
                className={`chore-list-item ${event.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}
              >
                <div className="chore-checkbox">
                  <input
                    type="checkbox"
                    checked={event.completed}
                    onChange={(e) => handleCompleteToggle(event, e.target.checked)}
                    id={`chore-${event.id}`}
                  />
                </div>
                <div className="chore-content" onClick={() => onEditChore(chore)}>
                  <div className="chore-header">
                    <span className="chore-category-icon">{getCategoryIcon(event.category)}</span>
                    <span className="chore-title">{event.title}</span>
                    {event.isRecurring && chore.recurrence && (
                      <span className="recurrence-badge">
                        {getFrequencyLabel(chore.recurrence.frequency)}
                      </span>
                    )}
                  </div>
                  {chore.description && (
                    <p className="chore-description">{chore.description}</p>
                  )}
                  <div className="chore-meta">
                    <span className="chore-due-date">
                      {isOverdue && <span className="overdue-label">Overdue: </span>}
                      {formatDisplayDate(parseDate(event.date))}
                    </span>
                    {member && (
                      <span className="chore-assignee">
                        <span
                          className="assignee-color"
                          style={{ backgroundColor: member.color }}
                        />
                        {member.name}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
