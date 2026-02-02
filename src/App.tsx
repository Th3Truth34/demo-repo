import { useState, Component, ReactNode, ErrorInfo } from 'react';
import { HouseholdProvider, useHouseholdContext } from './context/HouseholdContext';
import { MemberProvider } from './context/MemberContext';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { ChoreProvider } from './context/ChoreContext';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { MobileDrawer } from './components/Layout/MobileDrawer';
import { ChoreCalendar } from './components/Calendar/ChoreCalendar';
import { ChoreList } from './components/Chores/ChoreList';
import { ChoreModal } from './components/Chores/ChoreModal';
import { MemberManager } from './components/Members/MemberManager';
import { MaintenanceList } from './components/Recommendations/MaintenanceList';
import { HouseholdSetup } from './components/Onboarding/HouseholdSetup';
import { MemberSelection } from './components/Onboarding/MemberSelection';
import { Chore } from './types';
import './styles/variables.css';
import './styles/calendar.css';

// Error Boundary to catch render errors
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: 'red' }}>Something went wrong</h1>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

type ViewType = 'calendar' | 'list' | 'recommendations';

function MainApp() {
  const [currentView, setCurrentView] = useState<ViewType>('calendar');
  const [isChoreModalOpen, setIsChoreModalOpen] = useState(false);
  const [isMemberManagerOpen, setIsMemberManagerOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [initialDate, setInitialDate] = useState<string | undefined>();

  const handleAddChore = (date?: string) => {
    setEditingChore(null);
    setInitialDate(date);
    setIsChoreModalOpen(true);
  };

  const handleEditChore = (chore: Chore) => {
    setEditingChore(chore);
    setInitialDate(undefined);
    setIsChoreModalOpen(true);
  };

  const handleCloseChoreModal = () => {
    setIsChoreModalOpen(false);
    setEditingChore(null);
    setInitialDate(undefined);
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'calendar':
        return <ChoreCalendar onEditChore={handleEditChore} onAddChore={handleAddChore} />;
      case 'list':
        return <ChoreList onEditChore={handleEditChore} />;
      case 'recommendations':
        return <MaintenanceList />;
      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      <Header
        onOpenMemberManager={() => setIsMemberManagerOpen(true)}
        onToggleMobileMenu={() => setIsMobileDrawerOpen(prev => !prev)}
      />
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onAddChore={() => handleAddChore()}
      />
      <main className="main-content">
        {renderMainContent()}
      </main>

      <ChoreModal
        isOpen={isChoreModalOpen}
        onClose={handleCloseChoreModal}
        editChore={editingChore}
        initialDate={initialDate}
      />

      <MemberManager
        isOpen={isMemberManagerOpen}
        onClose={() => setIsMemberManagerOpen(false)}
      />

      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        currentView={currentView}
        onViewChange={setCurrentView}
        onAddChore={() => handleAddChore()}
      />
    </div>
  );
}

function AuthenticatedApp() {
  const { currentUser } = useAuthContext();
  const { members } = useHouseholdContext();

  // If no current user but we have members, show member selection
  if (!currentUser && members.length > 0) {
    return <MemberSelection />;
  }

  return <MainApp />;
}

function AppWithHousehold() {
  const { householdId, isLoading } = useHouseholdContext();

  // Still loading
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

  // No household - show setup
  if (!householdId) {
    return <HouseholdSetup />;
  }

  // Have household - render full app with all providers
  return (
    <MemberProvider>
      <AuthProvider>
        <ChoreProvider>
          <AuthenticatedApp />
        </ChoreProvider>
      </AuthProvider>
    </MemberProvider>
  );
}

function App() {
  console.log('App component rendering...');
  return (
    <ErrorBoundary>
      <HouseholdProvider>
        <AppWithHousehold />
      </HouseholdProvider>
    </ErrorBoundary>
  );
}

export default App;
