

import React, { useState, useMemo, useEffect } from 'react';
import { Project, User } from '../types';
import { parseRolesFromMarkdown } from '../utils/be-logic';

interface TeamAssignmentsViewProps {
    project: Project;
    onUpdateTeam: (newTeam: any, newOwnerId?: string) => void;
    currentUser: User;
}

export const TeamAssignmentsView: React.FC<TeamAssignmentsViewProps> = ({ project, onUpdateTeam, currentUser }) => {
    const [teamAssignments, setTeamAssignments] = useState(project.team || []);

    const extractedRoles = useMemo(() => {
        const resourceDoc = project.documents.find(d => {
            const title = d.title.toLowerCase();
            return title.includes('resources') && title.includes('skills');
        });
        if (!resourceDoc || !project.phasesData || !project.phasesData[resourceDoc.id]) return [];
        return parseRolesFromMarkdown(project.phasesData[resourceDoc.id].content);
    }, [project.documents, project.phasesData]);

    useEffect(() => {
        setTeamAssignments(project.team || []);
    }, [project.team]);

    const handleAssignmentChange = (role, field, value) => {
        const existingAssignmentIndex = teamAssignments.findIndex(a => a.role === role);
        let newAssignments = [...teamAssignments];
        if (existingAssignmentIndex > -1) {
            newAssignments[existingAssignmentIndex] = { ...newAssignments[existingAssignmentIndex], [field]: value };
        } else {
            newAssignments.push({ role, name: '', email: '', [field]: value, userId: `temp-${Date.now()}` });
        }
        const filteredAssignments = newAssignments.filter(a => (a.name && a.name.trim() !== '') || (a.email && a.email.trim() !== ''));
        setTeamAssignments(filteredAssignments);
        onUpdateTeam(filteredAssignments);
    };

    const handleNotificationToggle = (role, checked) => {
        const assignment = teamAssignments.find(a => a.role === role);
        if (!assignment || !assignment.name || !assignment.email) return;
        handleAssignmentChange(role, 'sendNotifications', checked);
    };

    const handleTransferOwnership = (newOwnerId: string) => {
        if (!window.confirm("Are you sure you want to transfer ownership of this project? This action cannot be undone.")) return;
        
        const newTeam = project.team.map(member => {
            if (member.userId === newOwnerId) return { ...member, isOwner: true };
            if (member.userId === project.ownerId) return { ...member, isOwner: false };
            return member;
        });

        onUpdateTeam(newTeam, newOwnerId);
    };

    const handleLeadershipToggle = (role: string, checked: boolean) => {
        const assignment = teamAssignments.find(a => a.role === role);
        if (!assignment || !assignment.name || !assignment.email) return;
        handleAssignmentChange(role, 'isLeadership', checked);
    };

    if (extractedRoles.length === 0) {
        return (
             <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Team roles will be populated here once the 'Resources & Skills List' document is generated and approved.</p>
                <p style={{color: 'var(--secondary-text)', marginTop: '1rem'}}>If you have regenerated the Resources & Skills document, use the "Recreate Team/Resources Data" button above to reload the roles.</p>
             </div>
        )
    }

    return (
        <div>
             <p style={{color: 'var(--secondary-text)', marginBottom: '1.5rem'}}>Assign team members to roles. The project owner has full permissions.</p>
            <table className="task-list-table">
                <thead><tr><th>Role</th><th>Assigned To (Name)</th><th>Email</th><th>Send Notifications</th><th>Leadership</th><th>Actions</th></tr></thead>
                <tbody>
                    {extractedRoles.map(role => {
                        const assignment = teamAssignments.find(a => a.role === role) || { name: '', email: '' };
                        const member = project.team.find(m => m.role === role);
                        const canEnableNotifications = assignment.name && assignment.email;
                        const isOwner = member?.isOwner || member?.userId === project.ownerId;
                        return (
                            <tr key={role} style={{cursor: 'initial'}}>
                                <td>
                                    <strong>{role}</strong>
                                    {isOwner && <span style={{color: 'var(--accent-color)', marginLeft: '0.5rem', fontSize: '0.85em'}}>(Owner)</span>}
                                </td>
                                <td>
                                    <input type="text" value={assignment.name} onChange={(e) => handleAssignmentChange(role, 'name', e.target.value)} />
                                </td>
                                <td>
                                    <input type="email" value={assignment.email} onChange={(e) => handleAssignmentChange(role, 'email', e.target.value)} />
                                </td>
                                <td>
                                    <input 
                                        type="checkbox" 
                                        checked={assignment.sendNotifications || false}
                                        disabled={!canEnableNotifications}
                                        onChange={(e) => handleNotificationToggle(role, e.target.checked)}
                                        title={!canEnableNotifications ? 'Assign name and email first' : 'Send email when tasks are ready'}
                                    />
                                </td>
                                <td>
                                    <input 
                                        type="checkbox" 
                                        checked={assignment.isLeadership || false}
                                        disabled={!canEnableNotifications}
                                        onChange={(e) => handleLeadershipToggle(role, e.target.checked)}
                                        title={!canEnableNotifications ? 'Assign name and email first' : 'Receives dashboard reports (not assigned to tasks)'}
                                    />
                                </td>
                                <td>
                                    {currentUser.id === project.ownerId && member && !isOwner && (
                                        <button className="button button-small" onClick={() => handleTransferOwnership(member.userId)}>Make Owner</button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
