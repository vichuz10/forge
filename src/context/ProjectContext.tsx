import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  setDoc
} from 'firebase/firestore';

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
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Default seed data
const defaultProjects: Project[] = [
  { id: '1', name: 'QA Automation', key: 'QA' },
  { id: '2', name: 'Core API Dev', key: 'API' },
  { id: '3', name: 'Mobile Apps', key: 'MOB' }
];

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [activeProject, setActiveProject] = useState<Project>(defaultProjects[0]);
  const [users, setUsers] = useState<User[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  // Build current user from Firebase auth
  const currentUser: User = firebaseUser
    ? {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Anonymous',
        role: 'Team Member',
        avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      }
    : {
        id: 'anonymous',
        name: 'Anonymous',
        role: 'Guest',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      };

  // Register current user in Firestore on login
  useEffect(() => {
    if (!firebaseUser) return;
    const userRef = doc(db, 'users', firebaseUser.uid);
    setDoc(userRef, {
      name: firebaseUser.displayName || 'Anonymous',
      role: 'Team Member',
      avatar: firebaseUser.photoURL || ''
    }, { merge: true });
  }, [firebaseUser]);

  // Real-time listener: Projects
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'projects'), (snapshot) => {
      if (snapshot.empty) {
        // Seed default projects on first load
        defaultProjects.forEach(p => {
          setDoc(doc(db, 'projects', p.id), { name: p.name, key: p.key });
        });
        setProjects(defaultProjects);
      } else {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
        setProjects(docs);
        // Keep active project synced
        if (!docs.find(p => p.id === activeProject.id)) {
          setActiveProject(docs[0]);
        }
      }
    });
    return () => unsub();
  }, []);

  // Real-time listener: Users
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
      setUsers(docs);
    });
    return () => unsub();
  }, []);

  // Real-time listener: Issues
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'issues'), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Issue));
      setIssues(docs);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const createIssue = async (issueData: Omit<Issue, 'id' | 'comments' | 'history' | 'createdAt'>) => {
    const projectIssues = issues.filter(i => i.projectId === issueData.projectId);
    const issueNum = projectIssues.length + 1;
    const projectKey = projects.find(p => p.id === issueData.projectId)?.key || 'FRG';
    const ticketId = `${projectKey}-${issueNum}`;

    const newIssue = {
      ...issueData,
      ticketKey: ticketId,
      comments: [],
      history: [
        {
          id: `h-${Date.now()}`,
          userId: currentUser.id,
          action: 'created the issue',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };

    // Use ticketId as the document ID so it shows as QA-1, etc.
    await setDoc(doc(db, 'issues', ticketId), newIssue);
  };

  const updateIssue = async (issueId: string, updates: Partial<Issue>) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    const newHistoryItems: ActivityLog[] = [];
    const changedKeys = Object.keys(updates) as (keyof Issue)[];

    changedKeys.forEach(key => {
      if (key === 'status' && updates.status !== issue.status) {
        const statusLabels: Record<string, string> = {
          backlog: 'Backlog', todo: 'To Do', inprogress: 'In Progress', inreview: 'In Review', done: 'Done'
        };
        newHistoryItems.push({
          id: `h-${Date.now()}-${key}`,
          userId: currentUser.id,
          action: `moved status to ${statusLabels[updates.status!] || updates.status}`,
          timestamp: new Date().toISOString()
        });
      } else if (key === 'assigneeId' && updates.assigneeId !== issue.assigneeId) {
        const newAssignee = users.find(u => u.id === updates.assigneeId);
        newHistoryItems.push({
          id: `h-${Date.now()}-${key}`,
          userId: currentUser.id,
          action: `reassigned to ${newAssignee?.name || 'Unassigned'}`,
          timestamp: new Date().toISOString()
        });
      } else if (key === 'priority' && updates.priority !== issue.priority) {
        newHistoryItems.push({
          id: `h-${Date.now()}-${key}`,
          userId: currentUser.id,
          action: `changed priority to ${updates.priority}`,
          timestamp: new Date().toISOString()
        });
      }
    });

    const updatedHistory = [...(issue.history || []), ...newHistoryItems];
    await updateDoc(doc(db, 'issues', issueId), { ...updates, history: updatedHistory });
  };

  const deleteIssue = async (issueId: string) => {
    await deleteDoc(doc(db, 'issues', issueId));
  };

  const addComment = async (issueId: string, text: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      authorId: currentUser.id,
      text,
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...(issue.comments || []), newComment];
    await updateDoc(doc(db, 'issues', issueId), { comments: updatedComments });
  };

  const addUser = async (name: string, role: string) => {
    const newId = `u-${Date.now()}`;
    await setDoc(doc(db, 'users', newId), {
      name,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&size=150`
    });
  };

  const createProject = async (name: string, key: string) => {
    const newId = `p-${Date.now()}`;
    const newProj: Project = { id: newId, name, key: key.toUpperCase().trim() };
    await setDoc(doc(db, 'projects', newId), { name: newProj.name, key: newProj.key });
    setActiveProject(newProj);
  };

  // Compile global activity feed across all issues
  const activityFeed = issues
    .flatMap(issue =>
      (issue.history || []).map(log => ({
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
        activityFeed,
        loading
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
