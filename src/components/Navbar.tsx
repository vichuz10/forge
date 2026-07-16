import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { LayoutDashboard, KanbanSquare, Users, ChevronDown, CheckSquare, Plus, Check, X } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onCreateIssueClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onCreateIssueClick }) => {
  const { projects, activeProject, setActiveProject, currentUser, createProject } = useProject();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const [showProjForm, setShowProjForm] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjKey, setNewProjKey] = useState('');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'board', label: 'Kanban Board', icon: <KanbanSquare size={18} /> },
    { id: 'teams', label: 'Teams', icon: <Users size={18} /> }
  ];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim() || !newProjKey.trim()) return;
    createProject(newProjName, newProjKey);
    setNewProjName('');
    setNewProjKey('');
    setShowProjForm(false);
    setDropdownOpen(false);
  };

  return (
    <header className="navbar glass-panel">
      <div className="navbar-logo-section">
        <div className="navbar-logo">
          <CheckSquare size={22} className="logo-icon" />
          <span className="logo-text text-gradient">ZenTrack</span>
        </div>
        
        {/* Project Selector */}
        <div className="project-selector-container">
          <button 
            className="project-selector-btn"
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setShowProjForm(false);
            }}
          >
            <span className="project-key">{activeProject.key}</span>
            <span className="project-name">{activeProject.name}</span>
            <ChevronDown size={16} />
          </button>
          
          {dropdownOpen && (
            <div className="project-dropdown glass-panel anim-scale-in">
              <div className="dropdown-header">Workspaces</div>
              <div className="project-list-items">
                {projects.map(project => (
                  <button
                    key={project.id}
                    className={`dropdown-item ${activeProject.id === project.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveProject(project);
                      setDropdownOpen(false);
                      setShowProjForm(false);
                    }}
                  >
                    <span className="project-key-tag">{project.key}</span>
                    <span>{project.name}</span>
                  </button>
                ))}
              </div>

              <div className="dropdown-divider"></div>

              {!showProjForm ? (
                <button 
                  className="dropdown-create-btn" 
                  onClick={() => setShowProjForm(true)}
                >
                  <Plus size={14} /> Create Project
                </button>
              ) : (
                <form onSubmit={handleCreateProject} className="dropdown-create-form">
                  <input
                    type="text"
                    className="form-input dropdown-form-input"
                    placeholder="Project Name (e.g. Website)"
                    value={newProjName}
                    onChange={e => setNewProjName(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="form-input dropdown-form-input"
                    placeholder="Key (e.g. WEB)"
                    value={newProjKey}
                    onChange={e => setNewProjKey(e.target.value)}
                    maxLength={5}
                    required
                  />
                  <div className="dropdown-form-actions">
                    <button 
                      type="button" 
                      className="btn btn-secondary dropdown-form-btn" 
                      onClick={() => setShowProjForm(false)}
                    >
                      <X size={12} />
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary dropdown-form-btn"
                    >
                      <Check size={12} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      <nav className="navbar-links">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab-btn ${currentTab === tab.id ? 'active' : ''}`}
            onClick={() => setCurrentTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="navbar-actions">
        <button className="btn btn-primary" onClick={onCreateIssueClick}>
          Create Issue
        </button>

        <div className="user-profile-widget">
          <img src={currentUser.avatar} alt={currentUser.name} className="user-avatar" />
          <div className="user-info">
            <div className="user-name">{currentUser.name}</div>
            <div className="user-role">{currentUser.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
