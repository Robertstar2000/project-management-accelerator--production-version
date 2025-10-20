

import { GoogleGenAI } from "@google/genai";
import { AWSBedrockService } from './utils/awsBedrockService';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './views/LandingPage';
import { ProjectDashboard } from './views/ProjectDashboard';
import { NewProjectModal } from './components/NewProjectModal';
import { UpgradeModal } from './components/UpgradeModal';
import { DeleteProjectConfirmationModal } from './components/DeleteProjectConfirmationModal';
import { HelpModal } from './components/HelpModal';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { GlobalStyles } from './styles/GlobalStyles';
import { DEFAULT_SPRINTS, TEMPLATES, DEFAULT_DOCUMENTS } from './constants/projectData';
import { logAction } from './utils/logging';
import { AuthView } from './views/AuthView';
import { ResetPasswordView } from './views/ResetPasswordView';
import * as authService from './utils/authService';
import { subscribeToUpdates, notifyUpdate } from './utils/syncService';
// FIX: Import Notification type to satisfy HeaderProps.
import { Project, Task, Notification } from './types';

const App = () => {
  const [ai, setAi] = useState<GoogleGenAI | AWSBedrockService | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState('pending');
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [appKey, setAppKey] = useState(0);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [userLimits, setUserLimits] = useState({ projectLimit: 3, projectCount: 0 });
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);

  const userProjects = useMemo(() => {
    if (!projects || !currentUser) return [];
    return projects.filter(p => p.ownerId === currentUser.id || p.team?.some(member => member.userId === currentUser.id));
  }, [projects, currentUser]);
  
  const recentlyViewedProjects = useMemo(() => {
    if (!projects || recentlyViewedIds.length === 0) return [];
    const userProjectIds = new Set(userProjects.map(p => p.id));
    return recentlyViewedIds
        .map(id => projects.find(p => p.id === id))
        .filter((p): p is Project => !!p && userProjectIds.has(p.id));
  }, [projects, userProjects, recentlyViewedIds]);

  const reloadStateFromStorage = useCallback(() => {
    if (!currentUser) return;
    try {
      logAction('Sync Update', 'BroadcastChannel', { message: 'Forcing state reload' });
      const storedProjects = localStorage.getItem(`hmap-projects-${currentUser.id}`);
      if (storedProjects) {
          setProjects(JSON.parse(storedProjects));
          const selectedProjectId = localStorage.getItem(`hmap-selected-project-id-${currentUser.id}`);
          if (selectedProjectId && selectedProject && selectedProjectId === selectedProject.id) {
              const updatedSelectedProject = JSON.parse(storedProjects).find(p => p.id === selectedProjectId);
              if (updatedSelectedProject) {
                  setSelectedProject(updatedSelectedProject);
              }
          }
      }
      setAppKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to reload state:', error);
    }
  }, [selectedProject, currentUser]);

  useEffect(() => {
    const unsubscribe = subscribeToUpdates(reloadStateFromStorage);
    return () => unsubscribe();
  }, [reloadStateFromStorage]);


  const initializeAi = useCallback((key: string, source: string): boolean => {
    try {
      const genAI = new GoogleGenAI({ apiKey: key });
      setAi(genAI);
      setApiKeyStatus(source);
      if (source === 'user' && currentUser) {
        localStorage.setItem(`hmap-gemini-key-${currentUser.id}`, key);
      }
      return true;
    } catch (error: any) {
      console.error(`Failed to initialize GoogleGenAI from ${source}:`, error);
      return false;
    }
  }, [currentUser]);

  const initializeAwsBedrock = useCallback(async (): Promise<boolean> => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const testResponse = await fetch(`${backendUrl}/api/bedrock/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'test' })
      });
      
      if (!testResponse.ok) {
        console.info('AWS Bedrock backend returned error:', testResponse.status);
        return false;
      }
      
      const bedrockService = new AWSBedrockService();
      setAi(bedrockService);
      setApiKeyStatus('aws');
      console.log('AWS Bedrock backend connected');
      return true;
    } catch (error: any) {
      console.info('AWS backend not available:', error.message);
      return false;
    }
  }, []);
  
  const handleSetUserKey = useCallback((key: string | null) => {
    if (key === null) { 
        setAi(null);
        if (currentUser) {
          localStorage.removeItem(`hmap-gemini-key-${currentUser.id}`);
        }
        setApiKeyStatus('none');
        logAction('Clear API Key', 'User Action', { apiKeyStatus: 'none' });
        return;
    }
    if (initializeAi(key, 'user')) {
        logAction('Set API Key', 'User Action', { apiKeyStatus: 'user' });
    } else {
        alert('The provided API Key appears to be invalid. Please check it and try again.');
    }
  }, [initializeAi, currentUser]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    
    try {
      const storedProjects = localStorage.getItem(`hmap-projects-${currentUser.id}`);
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      } else {
        localStorage.setItem(`hmap-projects-${currentUser.id}`, JSON.stringify([]));
      }
      const storedRecentIds = localStorage.getItem(`hmap-recently-viewed-${currentUser.id}`);
      if (storedRecentIds) {
          setRecentlyViewedIds(JSON.parse(storedRecentIds));
      }
    } catch (error: any) {
        console.error("Failed to load data from localStorage:", error);
        setProjects([]);
    }
  
    (async () => {
      let initialized = false;
      
      // Try AWS Bedrock first
      try {
        initialized = await initializeAwsBedrock();
        if (initialized) return;
      } catch (e) {
        console.info('AWS Bedrock error:', e);
      }

      // Try user's Gemini key
      const userKey = localStorage.getItem(`hmap-gemini-key-${currentUser.id}`);
      if (userKey) {
        initialized = initializeAi(userKey, 'user');
        if (initialized) return;
        localStorage.removeItem(`hmap-gemini-key-${currentUser.id}`);
      }
      
      // Try environment Gemini key
      const envGeminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (envGeminiKey) {
        initialized = initializeAi(envGeminiKey, 'promo');
        if (initialized) return;
      }
      
      console.warn('No AI service initialized');
      setApiKeyStatus('none');
    })();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setSelectedProject(null);
      return;
    }
    
    const selectedProjectId = localStorage.getItem(`hmap-selected-project-id-${currentUser.id}`);
    
    if (selectedProjectId && projects.length > 0) {
        const projectToSelect = projects.find(p => p.id === selectedProjectId);
        
        if (projectToSelect) {
            const isOwnerOrMember = projectToSelect.ownerId === currentUser.id || 
                                  projectToSelect.team?.some(member => member.userId === currentUser.id);
            if (isOwnerOrMember) {
                setSelectedProject(projectToSelect);
            } else {
                setSelectedProject(null);
                localStorage.removeItem(`hmap-selected-project-id-${currentUser.id}`);
            }
        } else {
            localStorage.removeItem(`hmap-selected-project-id-${currentUser.id}`);
        }
    }
  }, [currentUser, projects]);
  
  const saveProjectsToStorage = useCallback((updatedProjects: Project[]) => {
    if (!currentUser) return;
    try {
      localStorage.setItem(`hmap-projects-${currentUser.id}`, JSON.stringify(updatedProjects));
      notifyUpdate();
    } catch (error: any) {
      console.error("Failed to save projects to localStorage:", error);
      alert('Failed to save project data. Please check your browser storage settings.');
    }
  }, [currentUser]);

  const handleCreateProject = useCallback(async ({ name, template, mode, scope, teamSize, complexity }: any) => {
    if (userLimits.projectLimit !== -1 && userLimits.projectCount >= userLimits.projectLimit) {
      setShowUpgradeModal(true);
      return;
    }
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 44);
    
    const projectDocuments = JSON.parse(JSON.stringify(template.documents || DEFAULT_DOCUMENTS));
    
    const mandatoryDocs = [
        { title: 'Statement of Work (SOW)', phase: 5, sequence: 1 },
        { title: 'Resources & Skills List', phase: 2, sequence: 1 },
        { title: 'Detailed Plans (WBS/WRS)', phase: 7, sequence: 1 }
    ];

    mandatoryDocs.forEach(mandatoryDoc => {
        const simpleTitle = mandatoryDoc.title.replace(/\s\(.*\)/, '');
        const hasDoc = projectDocuments.some(doc => doc.title.includes(simpleTitle));
        
        if (!hasDoc) {
            projectDocuments.push({
                id: `doc-mandatory-${Date.now()}-${mandatoryDoc.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                title: mandatoryDoc.title, version: 'v1.0', status: 'Working', owner: 'A. User', phase: mandatoryDoc.phase,
                sequence: mandatoryDoc.sequence,
            });
        }
    });

    if (scope === 'subcontracted') {
        const hasRFP = projectDocuments.some(doc => doc.title.toLowerCase().includes('request for proposal') || doc.title.toLowerCase().includes('rfp'));
        if (!hasRFP) {
            projectDocuments.push({
                id: `doc-subco-${Date.now()}-rfp`, title: 'Request for Proposal (RFP)', version: 'v1.0', status: 'Working', owner: 'A. User', phase: 2, sequence: 50,
            });
        }
        
        const hasContract = projectDocuments.some(doc => doc.title.toLowerCase().includes('contract') || doc.title.toLowerCase().includes('agreement'));
        if (!hasContract) {
             projectDocuments.push({
                id: `doc-subco-${Date.now()}-contract`, title: "Draft Contract with T's & C's", version: 'v1.0', status: 'Working', owner: 'A. User', phase: 5, sequence: 50,
            });
        }
    }
    
    const newProject: Project = { 
        id: Date.now().toString(), name, mode, scope, generationMode: 'manual', teamSize, complexity: complexity || 'typical', discipline: template.discipline,
        ownerId: currentUser.id,
        phasesData: {},
        team: [{ userId: currentUser.id, role: 'Project Owner', name: currentUser.username, email: currentUser.email }],
        documents: projectDocuments, tasks: [], sprints: JSON.parse(JSON.stringify(DEFAULT_SPRINTS)), milestones: [], resources: [],
        avgBurdenedLaborRate: 125, budget: 100000,
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        changeRequest: { title: 'Add new login provider', reason: 'User request for SSO', impactStr: '+15d +5000c' },
        scenarios: [
            { id: 1, name: 'A: Use contractors', impactStr: '+10d +8000c' },
            { id: 2, name: 'B: Defer feature', impactStr: '+0d +0c' },
        ],
        notifications: [],
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
    sessionStorage.setItem('hmap-new-project-id', newProject.id);
    handleSelectProject(newProject);
    handleModalOpen(false);
    logAction('Create Project', newProject.name, { newProject, allProjects: updatedProjects });
    
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/user/${currentUser.id}/increment-projects`, {
        method: 'POST'
      });
      setUserLimits(prev => ({ ...prev, projectCount: prev.projectCount + 1 }));
    } catch (e) {
      console.error('Failed to update project count:', e);
    }
  }, [projects, currentUser, saveProjectsToStorage, userLimits]);
  
  const handleSaveProject = useCallback((updatedProject: Project) => {
    const updatedProjects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
    if(selectedProject && selectedProject.id === updatedProject.id) {
        setSelectedProject(updatedProject);
    }
    logAction('Save Project', updatedProject.name, { updatedProject });
  }, [projects, selectedProject, saveProjectsToStorage]);
  
  const handleSelectProject = useCallback((project: Project | null) => {
    if (!currentUser) return;
    const projectName = project?.name || 'Home';
    const projectId = project?.id || null;
    logAction('Select Project', projectName, { projectId });
    setSelectedProject(project);
    if (project) {
        localStorage.setItem(`hmap-selected-project-id-${currentUser.id}`, project.id);
        const MAX_RECENT = 4;
        const updatedRecentIds = [
            project.id,
            ...recentlyViewedIds.filter(id => id !== project.id)
        ].slice(0, MAX_RECENT);
        
        setRecentlyViewedIds(updatedRecentIds);
        localStorage.setItem(`hmap-recently-viewed-${currentUser.id}`, JSON.stringify(updatedRecentIds));
    } else {
        localStorage.removeItem(`hmap-selected-project-id-${currentUser.id}`);
    }
  }, [recentlyViewedIds, currentUser]);

  const handleSelectTask = useCallback((project: Project, task: Task) => {
    logAction('Select Task from My Work', task.name, { projectId: project.id, taskId: task.id });
    handleSelectProject(project);
    sessionStorage.setItem('hmap-open-task-on-load', task.id);
  }, [handleSelectProject]);

  const handleModalOpen = useCallback((isOpen: boolean) => {
    logAction('Toggle New Project Modal', 'Modal', { isOpen });
    setIsModalOpen(isOpen);
  }, []);

  const cleanupProjectData = useCallback((projectId: string) => {
    if (!currentUser) return;
    localStorage.removeItem(`hmap-selected-project-id-${currentUser.id}`);
    localStorage.removeItem(`hmap-active-tab-${currentUser.id}-${projectId}`);
    localStorage.removeItem(`hmap-open-phases-${currentUser.id}-${projectId}`);
    localStorage.removeItem(`hmap-tracking-view-${currentUser.id}-${projectId}`);
    logAction('Cleanup Project Data', 'localStorage', { projectId });
  }, [currentUser]);

  const handleNewProjectRequest = useCallback(() => {
    logAction('Open Project Manager', 'User Action', {});
    handleModalOpen(true);
  }, [handleModalOpen]);

  const handleRequestDeleteProject = useCallback((project: Project) => {
    if (!project) return;
    logAction('Request Project Deletion', project.name, { projectId: project.id });
    setProjectToDelete(project);
    setIsDeleteConfirmationOpen(true);
    handleModalOpen(false);
  }, [handleModalOpen]);

  const handleConfirmDeletion = useCallback(async () => {
    if (!projectToDelete) return;
    logAction('Confirm Delete Project', projectToDelete.name, { projectId: projectToDelete.id });
    const updatedProjects = projects.filter(p => p.id !== projectToDelete.id);
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
    cleanupProjectData(projectToDelete.id);
    const updatedRecentIds = recentlyViewedIds.filter(id => id !== projectToDelete.id);
    setRecentlyViewedIds(updatedRecentIds);
    localStorage.setItem(`hmap-recently-viewed-${currentUser.id}`, JSON.stringify(updatedRecentIds));
    if (selectedProject && selectedProject.id === projectToDelete.id) {
        setSelectedProject(null);
    }
    setProjectToDelete(null);
    setIsDeleteConfirmationOpen(false);
    
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/user/${currentUser.id}/decrement-projects`, {
        method: 'POST'
      });
      setUserLimits(prev => ({ ...prev, projectCount: Math.max(0, prev.projectCount - 1) }));
    } catch (e) {
      console.error('Failed to update project count:', e);
    }
  }, [projectToDelete, projects, recentlyViewedIds, selectedProject, saveProjectsToStorage, cleanupProjectData, currentUser]);

  const handleToggleHelpModal = useCallback((isOpen: boolean) => {
      logAction('Toggle Help Modal', 'UI Action', { isOpen });
      setIsHelpModalOpen(isOpen);
  }, []);

  // FIX: Add notification handlers to pass to Header component.
  const handleNotificationClick = useCallback((notification: Notification) => {
    if (!selectedProject || !notification) return;

    logAction('Click Notification', 'Notification', { notificationId: notification.id });
    
    const updatedNotifications = selectedProject.notifications.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
    );
    
    const updatedProject = { ...selectedProject, notifications: updatedNotifications };
    handleSaveProject(updatedProject); 

    const task = selectedProject.tasks.find(t => t.id === notification.taskId);
    if (task) {
        sessionStorage.setItem('hmap-open-task-on-load', notification.taskId);
        setAppKey(prev => prev + 1);
    }
  }, [selectedProject, handleSaveProject]);

  const handleMarkAllRead = useCallback(() => {
    if (!selectedProject) return;
    
    logAction('Mark All Notifications Read', 'User Action', { projectId: selectedProject.id });
    
    const updatedNotifications = selectedProject.notifications.map(n => ({ ...n, read: true }));
    const updatedProject = { ...selectedProject, notifications: updatedNotifications };
    handleSaveProject(updatedProject);
  }, [selectedProject, handleSaveProject]);

  const handleLogout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
    setSelectedProject(null);
    setProjects([]);
    setRecentlyViewedIds([]);
  }, []);

  const handleAccountDeleted = useCallback(() => {
    setIsAccountSettingsOpen(false);
    handleLogout();
  }, [handleLogout]);

  useEffect(() => {
    if (currentUser) {
      fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/user/${currentUser.id}/limits`)
        .then(res => res.json())
        .then(data => setUserLimits(data))
        .catch(e => console.error('Failed to fetch user limits:', e));
    }
  }, [currentUser]);

  return (
    <>
        <style>{GlobalStyles}</style>

        {resetToken ? (
            <ResetPasswordView token={resetToken} onSuccess={() => setResetToken(null)} />
        ) : !currentUser ? (
            <AuthView onLogin={(user) => setCurrentUser(user)} />
        ) : (
            <>
                <Header 
                    onNewProject={handleNewProjectRequest} 
                    onHomeClick={() => handleSelectProject(null)}
                    disabled={!ai}
                    isLandingPage={!selectedProject}
                    currentUser={currentUser}
                    onLogout={handleLogout}
                    onOpenAccountSettings={() => setIsAccountSettingsOpen(true)}
                    notifications={selectedProject?.notifications || []}
                    onNotificationClick={handleNotificationClick}
                    onMarkAllRead={handleMarkAllRead}
                />
                <main>
                    {selectedProject ? (
                        <ProjectDashboard 
                            project={selectedProject} 
                            onBack={() => handleSelectProject(null)} 
                            ai={ai}
                            saveProject={handleSaveProject}
                            currentUser={currentUser}
                            key={appKey}
                        />
                    ) : (
                        <LandingPage
                            projects={userProjects}
                            onSelectProject={handleSelectProject}
                            onNewProject={handleNewProjectRequest}
                            apiKeyStatus={apiKeyStatus}
                            onSetUserKey={handleSetUserKey}
                            disabled={!ai}
                            onRequestDelete={handleRequestDeleteProject}
                            currentUser={currentUser}
                            onSelectTask={handleSelectTask}
                            recentlyViewedProjects={recentlyViewedProjects}
                        />
                    )}
                </main>
                <NewProjectModal 
                    isOpen={isModalOpen} 
                    onClose={() => handleModalOpen(false)} 
                    onCreateProject={handleCreateProject}
                    projects={userProjects}
                    onSelectProject={handleSelectProject}
                    onRequestDelete={handleRequestDeleteProject}
                    ai={ai}
                    currentUser={currentUser}
                />
                {projectToDelete && (
                  <DeleteProjectConfirmationModal
                      isOpen={isDeleteConfirmationOpen}
                      onClose={() => {
                          logAction('Cancel Project Deletion', projectToDelete.name, { projectId: projectToDelete.id });
                          setIsDeleteConfirmationOpen(false);
                          setProjectToDelete(null);
                      }}
                      onConfirm={handleConfirmDeletion}
                      projectName={projectToDelete.name}
                  />
                )}
                
                <UpgradeModal 
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    currentCount={userLimits.projectCount}
                    limit={userLimits.projectLimit}
                />
                
                <AccountSettingsModal
                    isOpen={isAccountSettingsOpen}
                    onClose={() => setIsAccountSettingsOpen(false)}
                    currentUser={currentUser}
                    onAccountDeleted={handleAccountDeleted}
                />
            </>
        )}
        
        <button className="help-fab" onClick={() => handleToggleHelpModal(true)} aria-label="Open Help">?</button>
        <HelpModal isOpen={isHelpModalOpen} onClose={() => handleToggleHelpModal(false)} />
        
        <footer style={{ textAlign: 'center', padding: '2rem 1rem', borderTop: '1px solid var(--border-color)', marginTop: '3rem', fontSize: '0.9rem' }}>
            Project Accelerator Application Created by <span style={{ fontWeight: 'bold' }}>
                <span style={{ color: '#FF6B6B' }}>M</span>
                <span style={{ color: '#4ECDC4' }}>I</span>
                <span style={{ color: '#FFE66D' }}>F</span>
                <span style={{ color: '#95E1D3' }}>E</span>
                <span style={{ color: '#F38181' }}>C</span>
                <span style={{ color: '#AA96DA' }}>O</span>
            </span> ©2025
        </footer>
    </>
  );
};

export default App;