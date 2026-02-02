import { useChoreContext } from '../../context/ChoreContext';
import { useMemberContext } from '../../context/MemberContext';
import { useAuthContext } from '../../context/AuthContext';

type ViewType = 'calendar' | 'list' | 'recommendations';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onAddChore: () => void;
}

export function Sidebar({ currentView, onViewChange, onAddChore }: SidebarProps) {
  const { chores } = useChoreContext();
  const { members } = useMemberContext();
  const { currentUser } = useAuthContext();

  const pendingChores = chores.filter(c => !c.completed);
  const completedChores = chores.filter(c => c.completed);
  const myChores = currentUser
    ? chores.filter(c => c.assigneeId === currentUser.id && !c.completed)
    : [];

  return (
    <aside className="sidebar">
      <button className="btn btn-primary add-chore-btn" onClick={onAddChore}>
        + Add Chore
      </button>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`}
          onClick={() => onViewChange('calendar')}
        >
          <span className="nav-icon">📅</span>
          Calendar
        </button>
        <button
          className={`nav-item ${currentView === 'list' ? 'active' : ''}`}
          onClick={() => onViewChange('list')}
        >
          <span className="nav-icon">📋</span>
          Chore List
        </button>
        <button
          className={`nav-item ${currentView === 'recommendations' ? 'active' : ''}`}
          onClick={() => onViewChange('recommendations')}
        >
          <span className="nav-icon">💡</span>
          Recommendations
        </button>
      </nav>

      <div className="sidebar-stats">
        <h3>Overview</h3>
        <div className="stat-item">
          <span className="stat-label">Pending</span>
          <span className="stat-value pending">{pendingChores.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Completed</span>
          <span className="stat-value completed">{completedChores.length}</span>
        </div>
        {currentUser && (
          <div className="stat-item">
            <span className="stat-label">My Tasks</span>
            <span className="stat-value my-tasks">{myChores.length}</span>
          </div>
        )}
      </div>

      <div className="sidebar-members">
        <h3>Household</h3>
        {members.length === 0 ? (
          <p className="empty-text">No members yet</p>
        ) : (
          <ul className="member-list">
            {members.map((member) => (
              <li key={member.id} className="member-item">
                <span
                  className="member-color"
                  style={{ backgroundColor: member.color }}
                />
                <span className="member-name">{member.name}</span>
                {member.isAdmin && <span className="admin-badge">Admin</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
