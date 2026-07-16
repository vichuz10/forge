import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { UserPlus, ShieldAlert } from 'lucide-react';
import './Teams.css';

const Teams: React.FC = () => {
  const { users, issues, addUser, activeProject } = useProject();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      setError('Please fill in both Name and Role.');
      return;
    }

    addUser(name, role);
    setName('');
    setRole('');
    setError('');
  };

  return (
    <div className="teams-container anim-fade-in">
      <div className="teams-header">
        <div>
          <span className="teams-eyebrow">workspace collaboration</span>
          <h2 className="teams-title">Team Management</h2>
        </div>
      </div>

      <div className="teams-layout-grid">
        {/* Members List */}
        <div className="members-list-card glass-panel">
          <h3 className="section-subtitle">Active Team Members ({users.length})</h3>
          
          <div className="members-grid">
            {users.map(user => {
              // Count assigned issues for this user in the active project
              const assignedIssues = issues.filter(
                i => i.assigneeId === user.id && i.projectId === activeProject.id
              );

              return (
                <div key={user.id} className="member-item-card glass-panel">
                  <div className="member-header">
                    <img src={user.avatar} alt={user.name} className="member-avatar" />
                    <div className="member-text-info">
                      <h4 className="member-name">{user.name}</h4>
                      <span className="member-role-tag">{user.role}</span>
                    </div>
                  </div>
                  
                  <div className="member-footer">
                    <div className="member-stats">
                      <span className="stats-label">Active Tasks:</span>
                      <span className="stats-count">{assignedIssues.length}</span>
                    </div>
                    {assignedIssues.length > 0 && (
                      <span className="member-active-badge">Busy</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Member Card */}
        <div className="add-member-card glass-panel">
          <div className="add-member-header">
            <UserPlus size={20} className="text-gradient" />
            <h3 className="add-member-title">Add Team Member</h3>
          </div>

          <form onSubmit={handleSubmit} className="add-member-form">
            {error && (
              <div className="form-error-banner">
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. John Doe"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setError('');
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role / Job Title</label>
              <select
                className="form-select"
                value={role}
                onChange={e => {
                  setRole(e.target.value);
                  setError('');
                }}
              >
                <option value="">Select Role...</option>
                <option value="QA Engineer">QA Engineer</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="DevOps Specialist">DevOps Specialist</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary add-member-btn">
              Add Member
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Teams;
