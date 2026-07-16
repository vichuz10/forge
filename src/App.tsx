import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import Teams from './components/Teams';
import IssueModal from './components/IssueModal';
import IssueDetails from './components/IssueDetails';
import LoginPage from './components/LoginPage';
import './App.css';

function MainLayout() {
  const [currentTab, setCurrentTab] = useState<string>('board');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'board':
        return (
          <KanbanBoard 
            onIssueClick={(issue) => setSelectedIssueId(issue.id)} 
            onCreateIssueClick={() => setCreateModalOpen(true)} 
          />
        );
      case 'teams':
        return <Teams />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        onCreateIssueClick={() => setCreateModalOpen(true)} 
      />
      <main className="app-main-content">
        {renderContent()}
      </main>

      {createModalOpen && (
        <IssueModal onClose={() => setCreateModalOpen(false)} />
      )}

      {selectedIssueId && (
        <IssueDetails 
          issueId={selectedIssueId} 
          onClose={() => setSelectedIssueId(null)} 
        />
      )}
    </div>
  );
}

function AuthGate() {
  const { firebaseUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Forge...</p>
      </div>
    );
  }

  if (!firebaseUser) {
    return <LoginPage />;
  }

  return (
    <ProjectProvider>
      <MainLayout />
    </ProjectProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;
