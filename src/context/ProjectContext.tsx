import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  type: 'bug' | 'task' | 'story';
  priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  status: 'backlog' | 'todo' | 'inprogress' | 'inreview' | 'done';
  assigneeId: string;
  reporterId: string;
  projectId: string;
  comments: Comment[];
  history: ActivityLog[];
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
}

interface ProjectContextType {
  projects: Project[];
  activeProject: Project;
  setActiveProject: (project: Project) => void;
  issues: Issue[];
  users: User[];
  currentUser: User;
  createIssue: (issue: Omit<Issue, 'id' | 'comments' | 'history' | 'createdAt'>) => void;
  updateIssue: (issueId: string, updates: Partial<Issue>) => void;
  deleteIssue: (issueId: string) => void;
  addComment: (issueId: string, text: string) => void;
  addUser: (name: string, role: string) => void;
  createProject: (name: string, key: string) => void;
  activityFeed: Array<ActivityLog & { issueTitle: string; issueId: string }>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Initial Seed Data
const defaultProjects: Project[] = [
  { id: '1', name: 'QA Automation', key: 'QA' },
  { id: '2', name: 'Core API Dev', key: 'API' },
  { id: '3', name: 'Mobile Apps', key: 'MOB' }
];

const defaultUsers: User[] = [
  { id: 'u1', name: 'M V Vishnujith', role: 'QA Lead & AI Engineer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  { id: 'u2', name: 'Sarah Connor', role: 'Product Manager', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
  { id: 'u3', name: 'Jane Doe', role: 'Frontend Engineer', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80' },
  { id: 'u4', name: 'John Smith', role: 'Backend Engineer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' }
];

const defaultIssues: Issue[] = [
  {
    id: 'QA-1',
    title: 'Playwright test runner fails during OAuth authentication in staging',
    description: 'The Playwright automation suite is getting a timeout during the staging auth handshake. It seems the Redirect URL gets blocked by CORS or the gateway fails to forward headers.',
    type: 'bug',
    priority: 'highest',
    status: 'inprogress',
    assigneeId: 'u1',
    reporterId: 'u3',
    projectId: '1',
    stepsToReproduce: '1. Run npm test:staging\n2. Wait for auth page to load\n3. Click Login via OAuth\n4. Observe 504 timeout on redirect endpoint.',
    expectedBehavior: 'Redirect completes and Playwright receives auth token within 5 seconds.',
    actualBehavior: 'Playwright timeout triggered at 15 seconds.',
    comments: [
      { id: 'c1', authorId: 'u4', text: 'I updated the staging gateway headers, let me know if it still fails.', createdAt: new Date(Date.now() - 3600000).toISOString() }
    ],
    history: [
      { id: 'h1', userId: 'u3', action: 'created the issue', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: 'h2', userId: 'u1', action: 'moved status to In Progress', timestamp: new Date(Date.now() - 1800000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'QA-2',
    title: 'Write automation scripts for ticket lifecycle flow',
    description: 'Implement end-to-end automation scripts validating all states (backlog, todo, inprogress, review, done) on the Kanban board using Playwright.',
    type: 'task',
    priority: 'high',
    status: 'todo',
    assigneeId: 'u1',
    reporterId: 'u2',
    projectId: '1',
    comments: [],
    history: [
      { id: 'h3', userId: 'u2', action: 'created the task', timestamp: new Date(Date.now() - 72000000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 72000000).toISOString()
  },
  {
    id: 'QA-3',
    title: 'User profile page - dynamic theme selector integration',
    description: 'As a user, I want to toggle between Dark Mode, Cyberpunk Theme, and Light Mode to customize my workspace aesthetics.',
    type: 'story',
    priority: 'medium',
    status: 'backlog',
    assigneeId: 'u3',
    reporterId: 'u2',
    projectId: '1',
    comments: [],
    history: [],
    createdAt: new Date(Date.now() - 50000000).toISOString()
  },
  {
    id: 'API-1',
    title: 'Slow response times on /api/v1/issues list endpoint under load',
    description: 'Under simulated concurrency of 500 requests/sec, the issues retrieval response latency spikes above 3000ms. Likely missing indexes on projectId or status columns.',
    type: 'bug',
    priority: 'high',
    status: 'inreview',
    assigneeId: 'u4',
    reporterId: 'u1',
    projectId: '2',
    stepsToReproduce: '1. Run k6 load test script.\n2. Monitor logs on staging dashboard.\n3. Latency graphs show large spikes.',
    expectedBehavior: 'Response latency should stay under 200ms.',
    actualBehavior: '99th percentile response latency is 3500ms.',
    comments: [],
    history: [],
    createdAt: new Date(Date.now() - 40000000).toISOString()
  }
];

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('zt_projects');
    return saved ? JSON.parse(saved) : defaultProjects;
  });
  const [activeProject, setActiveProject] = useState<Project>(() => {
    return projects[0] || defaultProjects[0];
  });
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('zt_users');
    return saved ? JSON.parse(saved) : defaultUsers;
  });
  const [issues, setIssues] = useState<Issue[]>(() => {
    const saved = localStorage.getItem('zt_issues');
    return saved ? JSON.parse(saved) : defaultIssues;
  });
  
  // Current logged in user (Defaulting to the QA Lead/AI Engineer)
  const currentUser = users[0];

  useEffect(() => {
    localStorage.setItem('zt_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('zt_issues', JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem('zt_users', JSON.stringify(users));
  }, [users]);

  const createIssue = (issueData: Omit<Issue, 'id' | 'comments' | 'history' | 'createdAt'>) => {
    const projectIssues = issues.filter(i => i.projectId === issueData.projectId);
    const issueNum = projectIssues.length + 1;
    const projectKey = projects.find(p => p.id === issueData.projectId)?.key || 'ZEN';
    const id = `${projectKey}-${issueNum}`;

    const newIssue: Issue = {
      ...issueData,
      id,
      comments: [],
      history: [
        {
          id: Math.random().toString(),
          userId: currentUser.id,
          action: 'created the issue',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };

    setIssues(prev => [newIssue, ...prev]);
  };

  const updateIssue = (issueId: string, updates: Partial<Issue>) => {
    setIssues(prev =>
      prev.map(issue => {
        if (issue.id !== issueId) return issue;

        const auditLogs: ActivityLog[] = [];
        const changeKeys = Object.keys(updates) as Array<keyof Issue>;
        
        changeKeys.forEach(key => {
          if (updates[key] !== issue[key]) {
            let detail = '';
            if (key === 'status') detail = `changed status from ${issue.status} to ${updates[key]}`;
            else if (key === 'priority') detail = `updated priority from ${issue.priority} to ${updates[key]}`;
            else if (key === 'assigneeId') {
              const prevName = users.find(u => u.id === issue.assigneeId)?.name || 'Unassigned';
              const nextName = users.find(u => u.id === updates[key])?.name || 'Unassigned';
              detail = `reassigned issue from ${prevName} to ${nextName}`;
            } else {
              detail = `updated ${String(key)}`;
            }

            auditLogs.push({
              id: Math.random().toString(),
              userId: currentUser.id,
              action: detail,
              timestamp: new Date().toISOString()
            });
          }
        });

        return {
          ...issue,
          ...updates,
          history: [...issue.history, ...auditLogs]
        };
      })
    );
  };

  const deleteIssue = (issueId: string) => {
    setIssues(prev => prev.filter(i => i.id !== issueId));
  };

  const addComment = (issueId: string, text: string) => {
    const newComment: Comment = {
      id: Math.random().toString(),
      authorId: currentUser.id,
      text,
      createdAt: new Date().toISOString()
    };

    setIssues(prev =>
      prev.map(issue => {
        if (issue.id !== issueId) return issue;
        return {
          ...issue,
          comments: [...issue.comments, newComment],
          history: [
            ...issue.history,
            {
              id: Math.random().toString(),
              userId: currentUser.id,
              action: 'added a comment',
              timestamp: new Date().toISOString()
            }
          ]
        };
      })
    );
  };

  const addUser = (name: string, role: string) => {
    const newUser: User = {
      id: `u${users.length + 1}`,
      name,
      role,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?auto=format&fit=crop&w=150&q=80`
    };
    setUsers(prev => [...prev, newUser]);
  };

  const createProject = (name: string, key: string) => {
    const newProj = {
      id: (projects.length + 1).toString(),
      name,
      key: key.toUpperCase().trim()
    };
    setProjects(prev => [...prev, newProj]);
    setActiveProject(newProj);
  };

  // Compile global activity feed across all issues
  const activityFeed = issues
    .flatMap(issue =>
      issue.history.map(log => ({
        ...log,
        issueTitle: issue.title,
        issueId: issue.id
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        setActiveProject,
        issues,
        users,
        currentUser,
        createIssue,
        updateIssue,
        deleteIssue,
        addComment,
        addUser,
        createProject,
        activityFeed
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};
