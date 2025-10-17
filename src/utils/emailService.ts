import { Project, Task, TeamMember } from '../types';

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
    
    // In a real implementation, this would call an email API
    // For now, we'll log it and show a console message
    console.log('Email would be sent to:', assignedMember.email);
    console.log('Subject:', `Task Ready: ${task.name}`);
    console.log('Body:', emailBody);
    
    // Simulate email sending
    // In production, integrate with services like SendGrid, AWS SES, or similar
    // await fetch('/api/send-email', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //         to: assignedMember.email,
    //         subject: `Task Ready: ${task.name}`,
    //         body: emailBody,
    //         attachments: [{ filename: 'phase1.txt', content: phase1Content }]
    //     })
    // });
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
            
            // Send notification if enabled
            if (assignedMember?.sendNotifications && assignedMember.email) {
                await sendTaskReadyEmail(depTask, assignedMember, project);
            }
        }
    }
};
