import { useState } from 'react';
import { useHouseholdContext } from '../../context/HouseholdContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { DEFAULT_COLORS } from '../../context/MemberContext';

type SetupMode = 'choose' | 'create' | 'join' | 'select-member' | 'success';

export function HouseholdSetup() {
  const { createNewHousehold, joinExistingHousehold, householdCode, members, isLoading, error } = useHouseholdContext();
  const [, setCurrentUserId] = useLocalStorage<string | null>('current-user-id', null);

  const [mode, setMode] = useState<SetupMode>('choose');
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const member = await createNewHousehold({
        name: name.trim(),
        color: selectedColor,
        isAdmin: true,
      });
      setCurrentUserId(member.id);
      setMode('success');
    } catch (err) {
      // Error is handled by context
    }
  };

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setJoinError('');
    const success = await joinExistingHousehold(joinCode.trim());
    if (success) {
      setMode('select-member');
    } else {
      setJoinError('Invalid household code. Please check and try again.');
    }
  };

  const handleSelectMember = (memberId: string) => {
    setCurrentUserId(memberId);
    // AuthContext reads from localStorage, so React will re-render naturally
  };

  const copyCodeToClipboard = () => {
    if (householdCode) {
      navigator.clipboard.writeText(householdCode);
    }
  };

  if (isLoading) {
    return (
      <div className="welcome-screen">
        <div className="welcome-card">
          <div className="welcome-header">
            <h1>Loading...</h1>
            <p>Connecting to your household...</p>
          </div>
        </div>
      </div>
    );
  }

  // Choose mode: Create or Join
  if (mode === 'choose') {
    return (
      <div className="welcome-screen">
        <div className="welcome-card">
          <div className="welcome-header">
            <h1>Welcome to Home Chore Manager!</h1>
            <p>Manage your household chores together with your family.</p>
          </div>

          <div className="setup-options">
            <button
              className="setup-option-btn"
              onClick={() => setMode('create')}
            >
              <span className="setup-option-icon">+</span>
              <span className="setup-option-title">Create New Household</span>
              <span className="setup-option-desc">Start fresh and invite your family</span>
            </button>

            <button
              className="setup-option-btn"
              onClick={() => setMode('join')}
            >
              <span className="setup-option-icon">→</span>
              <span className="setup-option-title">Join Existing Household</span>
              <span className="setup-option-desc">Enter a code shared by your family</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create mode: Enter name and color
  if (mode === 'create') {
    return (
      <div className="welcome-screen">
        <div className="welcome-card">
          <div className="welcome-header">
            <h1>Create Your Household</h1>
            <p>Add yourself as the first member. You'll be the admin.</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleCreateHousehold} className="welcome-form">
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Choose Your Color</label>
              <div className="color-picker">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMode('choose')}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!name.trim() || isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Household'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Join mode: Enter household code
  if (mode === 'join') {
    return (
      <div className="welcome-screen">
        <div className="welcome-card">
          <div className="welcome-header">
            <h1>Join a Household</h1>
            <p>Enter the code shared by your family member.</p>
          </div>

          {(error || joinError) && <div className="error-message">{error || joinError}</div>}

          <form onSubmit={handleJoinHousehold} className="welcome-form">
            <div className="form-group">
              <label htmlFor="code">Household Code</label>
              <input
                id="code"
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g., SUNNY-KITCHEN-1234"
                autoFocus
                className="code-input"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMode('choose')}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!joinCode.trim() || isLoading}
              >
                {isLoading ? 'Joining...' : 'Join Household'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Select member mode: Choose who you are
  if (mode === 'select-member') {
    return (
      <div className="welcome-screen">
        <div className="welcome-card">
          <div className="welcome-header">
            <h1>Who are you?</h1>
            <p>Select your name from the household members.</p>
          </div>

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

  // Success mode: Show household code
  if (mode === 'success' && householdCode) {
    return (
      <div className="welcome-screen">
        <div className="welcome-card">
          <div className="welcome-header">
            <h1>Household Created!</h1>
            <p>Share this code with your family members so they can join:</p>
          </div>

          <div className="household-code-display">
            <code className="household-code">{householdCode}</code>
            <button
              className="btn btn-secondary btn-small"
              onClick={copyCodeToClipboard}
            >
              Copy
            </button>
          </div>

          <p className="welcome-note">
            You can find this code later in the app header.
          </p>

          <button
            className="btn btn-primary btn-large"
            onClick={() => {
              // The householdId is already set, so the parent component
              // will render the main app. This click handler is just for UX.
            }}
          >
            Continue to App
          </button>
        </div>
      </div>
    );
  }

  return null;
}
