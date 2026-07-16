import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { X, AlertTriangle, Sparkles } from 'lucide-react';
import { generateAiDescription } from '../utils/rovoAi';
import './IssueModal.css';

interface IssueModalProps {
  onClose: () => void;
}

const IssueModal: React.FC<IssueModalProps> = ({ onClose }) => {
  const { projects, activeProject, users, createIssue, currentUser } = useProject();
  
  const [projectId, setProjectId] = useState(activeProject.id);
  const [type, setType] = useState<'bug' | 'task' | 'story'>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'lowest' | 'low' | 'medium' | 'high' | 'highest'>('medium');
  const [assigneeId, setAssigneeId] = useState(currentUser.id);
  const [reporterId, setReporterId] = useState(currentUser.id);
  
  // Bug specific fields
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  
  const [validationError, setValidationError] = useState('');
  const [isRovoGenerating, setIsRovoGenerating] = useState(false);

  const handleRovoFill = () => {
    if (!title.trim()) {
      setValidationError('Please specify an issue summary/title first so Rovo AI has context to generate.');
      return;
    }
    
    setIsRovoGenerating(true);
    setTimeout(() => {
      const generated = generateAiDescription(title, type);
      setDescription(generated.description);
      if (type === 'bug') {
        setStepsToReproduce(generated.stepsToReproduce || '');
        setExpectedBehavior(generated.expectedBehavior || '');
        setActualBehavior(generated.actualBehavior || '');
      }
      setIsRovoGenerating(false);
    }, 850);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('Please specify an issue summary/title.');
      return;
    }

    createIssue({
      title,
      description,
      type,
      priority,
      status: 'todo',
      assigneeId,
      reporterId,
      projectId,
      ...(type === 'bug' && {
        stepsToReproduce,
        expectedBehavior,
        actualBehavior
      })
    });

    onClose();
  };

  return (
    <div className="modal-overlay anim-fade-in">
      <div className="modal-container glass-panel anim-scale-in">
        <div className="modal-header">
          <h3>Create Issue</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-content">
          {validationError && (
            <div className="form-error-banner">
              <AlertTriangle size={16} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Project & Type Row */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Project</label>
              <select 
                className="form-select"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Issue Type</label>
              <select 
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="bug">🐛 Bug / Defect</option>
                <option value="task">⚙️ Task</option>
                <option value="story">📖 User Story</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Summary / Title *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Playwright script timeout on login button click"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setValidationError('');
              }}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <div className="form-label-with-action">
              <label className="form-label">Description</label>
              <button 
                type="button" 
                className={`rovo-ai-trigger-btn ${isRovoGenerating ? 'generating' : ''}`}
                onClick={handleRovoFill}
                disabled={isRovoGenerating}
              >
                <Sparkles size={12} /> {isRovoGenerating ? 'Rovo is writing...' : 'Rovo AI Auto-Fill'}
              </button>
            </div>
            <textarea 
              className="form-textarea" 
              placeholder={isRovoGenerating ? "Rovo AI is analyzing title context and writing detailed description..." : "Describe the issue scope, context or related components..."}
              value={isRovoGenerating ? "" : description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isRovoGenerating}
            />
          </div>

          {/* Bug-Specific Fields (Visible only when type is 'bug') */}
          {type === 'bug' && (
            <div className="bug-details-section">
              <div className="bug-details-header">QA Defect Parameters</div>
              <div className="bug-fields-grid">
                <div className="form-group">
                  <label className="form-label">Steps to Reproduce</label>
                  <textarea 
                    className="form-textarea bug-textarea" 
                    placeholder="1. Navigate to...\n2. Click button...\n3. Observe result."
                    value={stepsToReproduce}
                    onChange={(e) => setStepsToReproduce(e.target.value)}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Expected Behavior</label>
                    <textarea 
                      className="form-textarea bug-textarea" 
                      placeholder="What should happen..."
                      value={expectedBehavior}
                      onChange={(e) => setExpectedBehavior(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Actual Behavior</label>
                    <textarea 
                      className="form-textarea bug-textarea" 
                      placeholder="What actually happens..."
                      value={actualBehavior}
                      onChange={(e) => setActualBehavior(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Priority & People Row */}
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select 
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="highest">🔴 Highest</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🔵 Low</option>
                <option value="lowest">⚪ Lowest</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select 
                className="form-select"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reporter</label>
              <select 
                className="form-select"
                value={reporterId}
                onChange={(e) => setReporterId(e.target.value)}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueModal;
