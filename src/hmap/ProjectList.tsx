import React from 'react';
import { Project } from '../types';

export const ProjectList = ({ projects, onSelectProject, onNewProject, disabled, onRequestDelete }: {
    projects: Project[];
    onSelectProject: (project: Project) => void;
    onNewProject: () => void;
    disabled: boolean;
    onRequestDelete: (project: Project) => void;
}) => {
    const handleSelect = (project: Project) => {
        if (disabled) {
            alert('Please provide an API Key before opening a project.');
            return;
        }
        onSelectProject(project);
    };

    const handleDelete = (e: React.MouseEvent, project: Project) => {
        e.stopPropagation();
        if (disabled) return;
        onRequestDelete(project);
    };

    return (
      <section>
        <div className="project-list-header">
          <h2 className="section-title" style={{textAlign: 'left', margin: 0}}>Your Projects</h2>
          <button
            onClick={onNewProject}
            className="button button-primary"
            disabled={disabled}
            title={disabled ? 'API Key required to start a new project' : 'Start New Project'}
          >
            Start New Project
          </button>
        </div>
        {projects.length > 0 ? (
          <div className="project-grid">
            {projects.map((p) => (
              <div key={p.id} className="project-card-container">
                <div 
                  className="project-card" 
                  onClick={() => handleSelect(p)} 
                  role="button" 
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelect(p)}
                  aria-disabled={disabled}
                  aria-label={`Open project ${p.name}`}
                  title={disabled ? 'API Key required to open project' : `Open ${p.name}`}
                >
                  <h3>{p.name}</h3>
                  <p>{p.discipline}</p>
                </div>
                <button 
                  className="button button-danger button-small delete-project-button"
                  onClick={(e) => handleDelete(e, p)}
                  disabled={disabled}
                  aria-label={`Delete project ${p.name}`}
                  title={disabled ? 'API Key required to delete project' : `Delete ${p.name}`}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
           <div className="no-projects">
            <h3>You have no projects yet.</h3>
            <p>Click "Start New Project" to begin.</p>
           </div>
        )}
      </section>
    );
};