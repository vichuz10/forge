import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { X, Send, Trash2, History, MessageSquare, CornerDownRight, Sparkles } from 'lucide-react';
import { generateAiDescription } from '../utils/rovoAi';
import './IssueDetails.css';

interface IssueDetailsProps {
  issueId: string;
  onClose: () => void;
}

const IssueDetails: React.FC<IssueDetailsProps> = ({ issueId, onClose }) => {
  const { issues, users, updateIssue, deleteIssue, addComment } = useProject();
  const [newComment, setNewComment] = useState('');
  const [isRovoGenerating, setIsRovoGenerating] = useState(false);

  const issue = issues.find(i => i.id === issueId);

  const handleRovoRewrite = () => {
    if (!issue) return;
    setIsRovoGenerating(true);
    setTimeout(() => {
      const generated = generateAiDescription(issue.title, issue.type);
      updateIssue(issue.id, {
        description: generated.description,
        ...(issue.type === 'bug' && {
          stepsToReproduce: generated.stepsToReproduce || '',
          expectedBehavior: generated.expectedBehavior || '',
          actualBehavior: generated.actualBehavior || ''
        })
      });
      setIsRovoGenerating(false);
    }, 850);
  };

  if (!issue) {
    return (
      <div className="details-sidebar-overlay" onClick={onClose}>
        <div className="details-sidebar glass-panel anim-slide-in" onClick={e => e.stopPropagation()}>
          <div className="details-header">
            <h3>Issue not found</h3>
            <button className="close-btn" onClick={onClose}><X size={18} /></button>
          </div>
        </div>
      </div>
    );
  }

  const handleStatusChange = (status: string) => {
    updateIssue(issue.id, { status: status as any });
  };

  const handlePriorityChange = (priority: string) => {
    updateIssue(issue.id, { priority: priority as any });
  };

  const handleAssigneeChange = (assigneeId: string) => {
    updateIssue(issue.id, { assigneeId });
  };

  const handleReporterChange = (reporterId: string) => {
    updateIssue(issue.id, { reporterId });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(issue.id, newComment);
    setNewComment('');
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${issue.id}?`)) {
      deleteIssue(issue.id);
      onClose();
    }
  };

  const getFormatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
  };

  return (
    <div className="details-sidebar-overlay" onClick={onClose}>
      <div className="details-sidebar glass-panel anim-slide-in" onClick={e => e.stopPropagation()}>
        {/* Header toolbar */}
        <div className="details-toolbar">
          <span className="details-ticket-key">{issue.id}</span>
          <div className="toolbar-actions">
            <button className="toolbar-btn delete-btn" onClick={handleDelete} title="Delete Issue">
              <Trash2 size={16} />
            </button>
            <button className="toolbar-btn close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="details-scroll-content">
          <div className="details-main-section">
            <h3 className="details-title">{issue.title}</h3>

            {/* Description */}
            <div className="details-block">
              <div className="form-label-with-action">
                <h4 className="block-title">Description</h4>
                <button 
                  type="button" 
                  className={`rovo-ai-trigger-btn ${isRovoGenerating ? 'generating' : ''}`}
                  onClick={handleRovoRewrite}
                  disabled={isRovoGenerating}
                >
                  <Sparkles size={12} /> {isRovoGenerating ? 'Rovo is writing...' : 'Rovo AI Auto-Fill'}
                </button>
              </div>
              <p className="details-description-text">
                {isRovoGenerating ? (
                  <span className="text-muted italic">Rovo AI is generating contextually rich description...</span>
                ) : (
                  issue.description || <span className="text-muted italic">No description provided. Click button to auto-fill.</span>
                )}
              </p>
            </div>

            {/* QA Parameters */}
            {issue.type === 'bug' && (
              <div className="details-block bug-parameters-card">
                <h4 className="block-title text-red">QA Parameters</h4>
                <div className="bug-details-grid">
                  <div className="bug-details-item">
                    <span className="bug-item-label">Steps to Reproduce:</span>
                    <pre className="bug-item-value">
                      {issue.stepsToReproduce || 'None specified.'}
                    </pre>
                  </div>
                  <div className="bug-details-item">
                    <span className="bug-item-label">Expected Behavior:</span>
                    <p className="bug-item-value">{issue.expectedBehavior || 'None specified.'}</p>
                  </div>
                  <div className="bug-details-item">
                    <span className="bug-item-label">Actual Behavior:</span>
                    <p className="bug-item-value">{issue.actualBehavior || 'None specified.'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="details-block comments-section">
              <h4 className="block-title"><MessageSquare size={16} /> Comments</h4>
              
              <form onSubmit={handleCommentSubmit} className="comment-input-form">
                <input
                  type="text"
                  className="form-input comment-input"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="comment-send-btn">
                  <Send size={14} />
                </button>
              </form>

              <div className="comments-list">
                {issue.comments.map(c => {
                  const author = users.find(u => u.id === c.authorId);
                  return (
                    <div key={c.id} className="comment-item">
                      <img src={author?.avatar} alt={author?.name} className="comment-avatar" />
                      <div className="comment-bubble">
                        <div className="comment-meta">
                          <span className="comment-author">{author?.name}</span>
                          <span className="comment-time">{getFormatTime(c.createdAt)}</span>
                        </div>
                        <p className="comment-text">{c.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Attributes */}
          <div className="details-sidebar-attributes">
            <div className="attribute-group">
              <span className="attribute-label">Status</span>
              <select
                className="form-select status-select"
                value={issue.status}
                onChange={e => handleStatusChange(e.target.value)}
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="inreview">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="attribute-group">
              <span className="attribute-label">Priority</span>
              <select
                className="form-select"
                value={issue.priority}
                onChange={e => handlePriorityChange(e.target.value)}
              >
                <option value="highest">🔴 Highest</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🔵 Low</option>
                <option value="lowest">⚪ Lowest</option>
              </select>
            </div>

            <div className="attribute-group">
              <span className="attribute-label">Assignee</span>
              <select
                className="form-select"
                value={issue.assigneeId}
                onChange={e => handleAssigneeChange(e.target.value)}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="attribute-group">
              <span className="attribute-label">Reporter</span>
              <select
                className="form-select"
                value={issue.reporterId}
                onChange={e => handleReporterChange(e.target.value)}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Audit Logs */}
            <div className="attribute-group audit-logs-group">
              <span className="attribute-label"><History size={14} /> Ticket Audit Log</span>
              <div className="ticket-logs-list">
                {issue.history.length > 0 ? (
                  issue.history.slice().reverse().map(log => {
                    const logUser = users.find(u => u.id === log.userId);
                    return (
                      <div key={log.id} className="ticket-log-item">
                        <CornerDownRight size={12} className="log-arrow" />
                        <div className="log-content">
                          <p className="log-text">
                            <strong>{logUser?.name || 'User'}</strong> {log.action}
                          </p>
                          <span className="log-time">{getFormatTime(log.timestamp)}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-muted italic text-xs">No history recorded yet.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetails;
