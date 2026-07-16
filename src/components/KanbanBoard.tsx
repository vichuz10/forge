import React, { useState } from 'react';
import { useProject, Issue } from '../context/ProjectContext';
import { Search, AlertCircle, FileText, Bookmark, ArrowUp, ArrowDown, HelpCircle, Plus } from 'lucide-react';
import './KanbanBoard.css';

interface KanbanBoardProps {
  onIssueClick: (issue: Issue) => void;
  onCreateIssueClick: () => void;
}

const columns = [
  { id: 'backlog', title: 'Backlog', status: 'backlog' },
  { id: 'todo', title: 'To Do', status: 'todo' },
  { id: 'inprogress', title: 'In Progress', status: 'inprogress' },
  { id: 'inreview', title: 'In Review', status: 'inreview' },
  { id: 'done', title: 'Done', status: 'done' }
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ onIssueClick, onCreateIssueClick }) => {
  const { activeProject, issues, users, updateIssue } = useProject();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Filter issues for active project
  const projectIssues = issues.filter(issue => issue.projectId === activeProject.id);

  // Apply filters
  const filteredIssues = projectIssues.filter(issue => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || issue.type === selectedType;
    const matchesPriority = selectedPriority === 'all' || issue.priority === selectedPriority;

    return matchesSearch && matchesType && matchesPriority;
  });

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, issueId: string) => {
    e.dataTransfer.setData('text/plain', issueId);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('text/plain');
    if (issueId) {
      updateIssue(issueId, { status: targetStatus as any });
    }
  };

  // Icons Helper
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug':
        return <AlertCircle size={15} className="text-red" />;
      case 'task':
        return <FileText size={15} className="text-cyan" />;
      case 'story':
        return <Bookmark size={15} className="text-green" />;
      default:
        return <HelpCircle size={15} />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'highest':
        return <ArrowUp size={16} className="priority-highest" />;
      case 'high':
        return <ArrowUp size={16} className="priority-high" />;
      case 'medium':
        return <ArrowUp size={16} className="priority-medium" />;
      case 'low':
        return <ArrowDown size={16} className="priority-low" />;
      case 'lowest':
        return <ArrowDown size={16} className="priority-lowest" />;
      default:
        return null;
    }
  };

  return (
    <div className="board-container anim-fade-in">
      {/* Filter and search Controls */}
      <div className="board-controls-bar">
        <div className="search-box-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input-field"
            placeholder="Search tickets, titles, descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters-group-container">
          <div className="filter-dropdown-widget">
            <span className="filter-label-prefix">Type:</span>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="filter-select-box"
            >
              <option value="all">All Types</option>
              <option value="bug">Bugs Only</option>
              <option value="task">Tasks Only</option>
              <option value="story">Stories Only</option>
            </select>
          </div>

          <div className="filter-dropdown-widget">
            <span className="filter-label-prefix">Priority:</span>
            <select 
              value={selectedPriority} 
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="filter-select-box"
            >
              <option value="all">All Priorities</option>
              <option value="highest">Highest</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="lowest">Lowest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Board Columns Grid */}
      <div className="board-grid">
        {columns.map(col => {
          const colIssues = filteredIssues.filter(i => i.status === col.status);
          return (
            <div
              key={col.id}
              className="board-column glass-panel"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.status)}
            >
              <div className="column-header">
                <div className="column-title-box">
                  <span className={`column-status-indicator status-${col.status}`}></span>
                  <h4 className="column-title">{col.title}</h4>
                </div>
                <span className="column-count-badge">{colIssues.length}</span>
              </div>

              <div className="column-card-list">
                {colIssues.map(issue => {
                  const assignee = users.find(u => u.id === issue.assigneeId);
                  return (
                    <div
                      key={issue.id}
                      className={`ticket-card glass-panel`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, issue.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onIssueClick(issue)}
                    >
                      <div className="ticket-header">
                        <span className="ticket-id">{issue.id}</span>
                        <div className="ticket-meta-icons">
                          {getPriorityIcon(issue.priority)}
                          <span className={`issue-type-badge type-${issue.type}`}>
                            {getTypeIcon(issue.type)}
                          </span>
                        </div>
                      </div>

                      <h5 className="ticket-title-text">{issue.title}</h5>

                      <div className="ticket-footer">
                        <span className={`badge badge-${issue.type}`}>{issue.type}</span>
                        {assignee ? (
                          <div className="ticket-assignee-avatar-wrapper" title={assignee.name}>
                            <img src={assignee.avatar} alt={assignee.name} className="assignee-card-avatar" />
                          </div>
                        ) : (
                          <div className="ticket-assignee-unassigned" title="Unassigned">
                            ?
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colIssues.length === 0 && (
                  <div className="column-empty-state">Drag issues here</div>
                )}
              </div>
              
              {col.status === 'backlog' && (
                <button className="column-add-btn" onClick={onCreateIssueClick}>
                  <Plus size={16} /> Add Issue
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
