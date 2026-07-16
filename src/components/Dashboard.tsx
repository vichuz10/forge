import React from 'react';
import { useProject } from '../context/ProjectContext';
import { AlertCircle, CheckCircle2, Clock, FileText, TrendingUp } from 'lucide-react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { activeProject, issues, activityFeed, users } = useProject();

  // Filter issues for the active project
  const projectIssues = issues.filter(issue => issue.projectId === activeProject.id);
  
  // Calculate statistics
  const totalCount = projectIssues.length;
  const bugCount = projectIssues.filter(i => i.type === 'bug').length;
  const inProgressCount = projectIssues.filter(i => i.status === 'inprogress').length;
  const doneCount = projectIssues.filter(i => i.status === 'done').length;

  const resolutionRate = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  // Group by priority
  const priorityCounts = {
    highest: projectIssues.filter(i => i.priority === 'highest').length,
    high: projectIssues.filter(i => i.priority === 'high').length,
    medium: projectIssues.filter(i => i.priority === 'medium').length,
    low: projectIssues.filter(i => i.priority === 'low').length,
    lowest: projectIssues.filter(i => i.priority === 'lowest').length
  };

  // Group by type
  const typeCounts = {
    bug: projectIssues.filter(i => i.type === 'bug').length,
    task: projectIssues.filter(i => i.type === 'task').length,
    story: projectIssues.filter(i => i.type === 'story').length
  };

  // Filter activity feed for issues belonging to this project
  const projectIssueIds = new Set(projectIssues.map(i => i.id));
  const projectActivity = activityFeed.filter(activity => projectIssueIds.has(activity.issueId)).slice(0, 5);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'highest': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#94a3b8';
    }
  };

  const getFormatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
  };

  return (
    <div className="dashboard-container anim-fade-in">
      <div className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">workspace overview</span>
          <h2 className="dashboard-title">{activeProject.name} Dashboard</h2>
        </div>
        <div className="dashboard-time">
          <Clock size={16} /> Active Sprint
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card glass-panel">
          <div className="metric-icon total">
            <FileText size={20} />
          </div>
          <div className="metric-data">
            <span className="metric-label">Total Issues</span>
            <span className="metric-value">{totalCount}</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon bug">
            <AlertCircle size={20} />
          </div>
          <div className="metric-data">
            <span className="metric-label">Active Bugs</span>
            <span className="metric-value">{bugCount}</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon progress">
            <TrendingUp size={20} />
          </div>
          <div className="metric-data">
            <span className="metric-label">In Progress</span>
            <span className="metric-value">{inProgressCount}</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon done">
            <CheckCircle2 size={20} />
          </div>
          <div className="metric-data">
            <span className="metric-label">Resolution Rate</span>
            <span className="metric-value">{resolutionRate}%</span>
          </div>
        </div>
      </div>

      {/* Main Grid Charts */}
      <div className="dashboard-charts-grid">
        {/* Issue Type Breakdown */}
        <div className="chart-card glass-panel">
          <h3 className="chart-title">Issue Breakdown</h3>
          <div className="type-distribution-container">
            {Object.entries(typeCounts).map(([type, count]) => {
              const percent = totalCount ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={type} className="distribution-row">
                  <div className="dist-labels">
                    <span className="dist-type-name capitalize">{type}</span>
                    <span className="dist-type-vals">{count} ({percent}%)</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className={`progress-bar-fill fill-${type}`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Level breakdown */}
        <div className="chart-card glass-panel">
          <h3 className="chart-title">Priority Breakdown</h3>
          <div className="priority-bars-container">
            {Object.entries(priorityCounts).map(([priority, count]) => {
              const percent = totalCount ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={priority} className="priority-bar-row">
                  <span className="priority-bar-label capitalize">{priority}</span>
                  <div className="priority-bar-track">
                    <div 
                      className="priority-bar-value"
                      style={{ 
                        width: `${percent || 2}%`, 
                        backgroundColor: getPriorityColor(priority)
                      }}
                    ></div>
                  </div>
                  <span className="priority-bar-number">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Log / Activity Feed */}
        <div className="chart-card glass-panel activity-feed-card">
          <h3 className="chart-title">Recent Activity Audit</h3>
          <div className="activity-feed-list">
            {projectActivity.length > 0 ? (
              projectActivity.map(activity => {
                const user = users.find(u => u.id === activity.userId);
                return (
                  <div key={activity.id} className="activity-item">
                    <img 
                      src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
                      alt={user?.name} 
                      className="activity-user-avatar"
                    />
                    <div className="activity-text-content">
                      <p className="activity-phrase">
                        <strong className="activity-username">{user?.name}</strong>{' '}
                        {activity.action} on{' '}
                        <span className="activity-ticket-id">#{activity.issueId}</span>:{' '}
                        <span className="activity-ticket-title">"{activity.issueTitle}"</span>
                      </p>
                      <span className="activity-time">{getFormatTime(activity.timestamp)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="activity-feed-empty">No recent updates in this workspace.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
