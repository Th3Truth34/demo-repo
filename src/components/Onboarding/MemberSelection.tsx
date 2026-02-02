import { useHouseholdContext } from '../../context/HouseholdContext';
import { useAuthContext } from '../../context/AuthContext';

export function MemberSelection() {
  const { members, householdCode } = useHouseholdContext();
  const { setCurrentUser } = useAuthContext();

  const handleSelectMember = (memberId: string) => {
    setCurrentUser(memberId);
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        <div className="welcome-header">
          <h1>Who are you?</h1>
          <p>Select your name from the household members.</p>
        </div>

        {householdCode && (
          <div className="household-code-info">
            <p>Household code: <code>{householdCode}</code></p>
          </div>
        )}

        <div className="member-selection">
          {members.map((member) => (
            <button
              key={member.id}
              className="member-select-btn"
              onClick={() => handleSelectMember(member.id)}
            >
              <span
                className="member-color-badge"
                style={{ backgroundColor: member.color }}
              />
              <span className="member-name">{member.name}</span>
              {member.isAdmin && <span className="admin-badge">Admin</span>}
            </button>
          ))}
        </div>

        <p className="welcome-note">
          Don't see your name? Ask an admin to add you to the household.
        </p>
      </div>
    </div>
  );
}
