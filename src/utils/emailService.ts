import { Project, Task, TeamMember } from '../types';

export const sendAgentStartEmail = async (
    task: Task,
    assignedMember: TeamMember,
    project: Project
): Promise<void> => {
    const phase1Doc = project.documents.find(d => d.phase === 1);
    const phase1Content = phase1Doc && project.phasesData[phase1Doc.id]?.content || '';
    
    const projectOwner = project.team.find(m => m.userId === project.ownerId);
    const ownerName = projectOwner?.name || 'Project Owner';
    const ownerEmail = projectOwner?.email || 'owner@project.com';
    
    const emailBody = `
Dear ${assignedMember.name},

Your task "${task.name}" is now being completed by an automated AI agent.

Task Details:
- Task: ${task.name}
- Description: ${task.description || 'No additional description'}
- Due Date: ${task.endDate}
- Role: ${task.role}

IMPORTANT: You are still responsible for reviewing and approving the agent's work.

A second email will be sent when the agent completes the task, containing:
- The agent's output document
- Instructions for review and approval

Project Context (Phase 1 Document):
${phase1Content}

Project: ${project.name}
Discipline: ${project.discipline}
Project Owner: ${ownerName} (${ownerEmail})

Best regards,
Project Management Accelerator
    `.trim();
    
    try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: assignedMember.email,
                subject: `AI Agent Starting: ${task.name}`,
                body: emailBody.replace(/\n/g, '<br>')
            })
        });
        console.log('Agent start email sent to:', assignedMember.email);
    } catch (error) {
        console.error('Failed to send agent start email:', error);
    }
};

export const sendAgentCompleteEmail = async (
    task: Task,
    assignedMember: TeamMember,
    project: Project,
    agentOutput: string
): Promise<void> => {
    const projectOwner = project.team.find(m => m.userId === project.ownerId);
    const ownerName = projectOwner?.name || 'Project Owner';
    const ownerEmail = projectOwner?.email || 'owner@project.com';
    
    const emailBody = `
Dear ${assignedMember.name},

The AI agent has completed your task "${task.name}".

Task Details:
- Task: ${task.name}
- Due Date: ${task.endDate}
- Role: ${task.role}

Agent Output Document:
${agentOutput}

REQUIRED ACTIONS:
1. Review the agent's output document attached above
2. Verify the work meets project requirements and quality standards
3. Report to ${ownerName} (${ownerEmail}) that the automated work is acceptable
4. Confirm with the project owner that the task can be marked as completed

You are responsible for ensuring the quality and accuracy of the agent's work before final approval.

Project: ${project.name}
Discipline: ${project.discipline}

Best regards,
Project Management Accelerator
    `.trim();
    
    try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: assignedMember.email,
                subject: `AI Agent Completed: ${task.name} - Review Required`,
                body: emailBody.replace(/\n/g, '<br>')
            })
        });
        console.log('Agent complete email sent to:', assignedMember.email);
    } catch (error) {
        console.error('Failed to send agent complete email:', error);
    }
};

export const sendTaskReadyEmail = async (
    task: Task,
    assignedMember: TeamMember,
    project: Project
): Promise<void> => {
    const phase1Doc = project.documents.find(d => d.phase === 1);
    const phase1Content = phase1Doc && project.phasesData[phase1Doc.id]?.content || '';
    
    const projectOwner = project.team.find(m => m.userId === project.ownerId);
    const ownerName = projectOwner?.name || 'Project Owner';
    const ownerEmail = projectOwner?.email || 'owner@project.com';
    
    const emailBody = `
Dear ${assignedMember.name},

Your task "${task.name}" is now ready to start. All prerequisite tasks have been completed.

Task Details:
- Task: ${task.name}
- Description: ${task.description || 'No additional description'}
- Due Date: ${task.endDate}
- Role: ${task.role}

Project Context (Phase 1 Document):
${phase1Content}

Important Instructions:
1. Report to ${ownerName} (${ownerEmail}) for reviews during task execution
2. Contact ${ownerName} when the task is complete for final approval
3. Ensure all deliverables meet project requirements

Project: ${project.name}
Discipline: ${project.discipline}

Best regards,
Project Management Accelerator
    `.trim();
    
    try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: assignedMember.email,
                subject: `Task Ready: ${task.name}`,
                body: emailBody.replace(/\n/g, '<br>')
            })
        });
        console.log('Task ready email sent to:', assignedMember.email);
    } catch (error) {
        console.error('Failed to send task ready email:', error);
    }
};

export const checkAndSendTaskNotifications = async (
    updatedTask: Task,
    allTasks: Task[],
    project: Project
): Promise<void> => {
    // Find tasks that depend on the updated task
    const dependentTasks = allTasks.filter(t => 
        t.dependsOn?.includes(updatedTask.id) && t.status !== 'done'
    );
    
    for (const depTask of dependentTasks) {
        // Check if all dependencies are now complete
        const allDepsComplete = depTask.dependsOn.every(depId => {
            const dep = allTasks.find(t => t.id === depId);
            return dep?.status === 'done';
        });
        
        if (allDepsComplete) {
            // Find assigned team member
            const assignedMember = project.team.find(m => m.role === depTask.role);
            
            if (assignedMember?.sendNotifications && assignedMember.email) {
                // Send agent start email if agent is enabled for this task
                if (depTask.useAgent) {
                    await sendAgentStartEmail(depTask, assignedMember, project);
                } else {
                    // Send regular task ready email
                    await sendTaskReadyEmail(depTask, assignedMember, project);
                }
            }
        }
    }
};
