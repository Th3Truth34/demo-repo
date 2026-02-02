import { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useMemberContext } from '../../context/MemberContext';
import { useHouseholdContext } from '../../context/HouseholdContext';

interface HeaderProps {
  onOpenMemberManager: () => void;
  onToggleMobileMenu: () => void;
}

export function Header({ onOpenMemberManager, onToggleMobileMenu }: HeaderProps) {
  const { currentUser, setCurrentUser, isAdmin } = useAuthContext();
  const { members } = useMemberContext();
  const { householdCode } = useHouseholdContext();
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (householdCode) {
      navigator.clipboard.writeText(householdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="hamburger-btn"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        <h1 className="header-title">Home Chore Manager</h1>
      </div>
      <div className="header-right">
        {householdCode && (
          <div className="household-code-container">
            <button
              className="btn btn-secondary btn-small"
              onClick={() => setShowCode(!showCode)}
            >
              Share Household
            </button>
            {showCode && (
              <div className="household-code-dropdown">
                <p>Share this code with family members:</p>
                <div className="code-display">
                  <code>{householdCode}</code>
                  <button
                    className="btn btn-small"
                    onClick={handleCopyCode}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {isAdmin && (
          <button className="btn btn-secondary" onClick={onOpenMemberManager}>
            Manage Members
          </button>
        )}
        <div className="user-select-container">
          <label htmlFor="user-select">Current User:</label>
          <select
            id="user-select"
            value={currentUser?.id || ''}
            onChange={(e) => setCurrentUser(e.target.value || null)}
            className="user-select"
          >
            <option value="">Select user...</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} {member.isAdmin ? '(Admin)' : ''}
              </option>
            ))}
          </select>
        </div>
        {currentUser && (
          <div
            className="current-user-badge"
            style={{ backgroundColor: currentUser.color }}
          >
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}
