


import React from 'react';

const diffInDays = (date1, date2) => {
    if (!date1 || !date2) return 0;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    // Add 1 to be inclusive of start and end dates for duration calculation
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

const currencyFormat = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num || 0);

export const DashboardView = ({ 
    project, phasesData, isPlanningComplete, projectPhases, 
    onAnalyzeRisks, onGenerateSummary, isGeneratingReport 
}) => {
    if (!isPlanningComplete) {
        return (
            <div className="tool-card" style={{ textAlign: 'center', padding: '4rem' }}>
                <h3 className="subsection-title">Dashboard Locked</h3>
                <p style={{ color: 'var(--secondary-text)', maxWidth: '600px', margin: '0 auto' }}>
                    Dashboard metrics will become available once all planning phases are complete and all required documents have been moved to "Approved" status in the Documents tab.
                </p>
            </div>
        );
    }

    const { tasks = [], documents = [], milestones = [], resources = [], avgBurdenedLaborRate = 0, budget = 0 } = project;

    // --- METRIC CALCULATIONS ---

    // Alerts & Risk
    const overdueTasks = tasks.filter(t => t.status !== 'done' && new Date(t.endDate) < new Date()).length;
    const blockedTasks = tasks.filter(task =>
        task.status !== 'done' &&
        task.dependsOn?.some(depId => {
            const prereq = tasks.find(t => t.id === depId);
            return prereq && prereq.status !== 'done';
        })
    ).length;
    const pendingApprovals = documents.filter(d => ['Working', 'Rejected'].includes(d.status)).length;
    const openScopeChanges = documents.filter(d => d.title.toLowerCase().includes('change request') && d.status !== 'Approved').length;
    let riskExposure = 'Low';
    if (overdueTasks > 5) riskExposure = 'High';
    else if (overdueTasks > 0) riskExposure = 'Medium';
    const riskExposureClass = riskExposure === 'High' ? 'red' : riskExposure === 'Medium' ? 'amber' : 'green';

    // Phase & Milestone Tracking
    const completedPhases = documents.filter(d => d.status === 'Approved').length;
    const totalPhases = documents.length;
    const inProgressPhase = projectPhases.find((p, i) => {
        const doc = documents.find(d => d.id === p.docId);
        const isComplete = doc?.status === 'Approved';
        const prevDoc = i > 0 ? documents.find(d => d.id === projectPhases[i - 1].docId) : null;
        const isPrevComplete = i === 0 || prevDoc?.status === 'Approved';
        return !isComplete && isPrevComplete;
    });
    
    // Task Completion Tracking
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const totalTasks = tasks.length;
    const taskCompletionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const nextMilestone = milestones
        .filter(m => m.status !== 'Completed')
        .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime())[0];

    // Financial Calculations
    const totalEstimatedLaborCost = tasks.reduce((sum, task) => {
        const duration = diffInDays(task.startDate, task.endDate);
        return sum + (duration * 8 * (avgBurdenedLaborRate || 0));
    }, 0);

    const actualLaborCostToDate = tasks.reduce((sum, task) => {
        if (task.status === 'done' || task.actualTime) {
            const duration = task.actualTime || diffInDays(task.startDate, task.endDate);
            return sum + (duration * 8 * (avgBurdenedLaborRate || 0));
        }
        return sum;
    }, 0);

    const totalEstimatedResourceCost = resources.reduce((sum, r) => sum + (r.estimate || 0), 0);
    const actualResourceCostToDate = resources.reduce((sum, r) => sum + (r.actual || 0), 0);

    const estimateAtCompletion = totalEstimatedLaborCost + totalEstimatedResourceCost;
    const costToDate = actualLaborCostToDate + actualResourceCostToDate;

    const costVariance = budget - estimateAtCompletion;
    const costVarianceClass = costVariance >= 0 ? 'green' : 'red';


    return (
        <div className="tool-grid" style={{ gridTemplateColumns: '3fr 1fr', alignItems: 'start' }}>
            <div className="tool-grid">
                <div className="tool-card">
                    <h3 className="subsection-title">Project Metrics</h3>
                    <div className="kpi-grid">
                        <div className="kpi-card"><h4>End Date</h4><p className="value" style={{ fontSize: '1.5rem' }}>{project.endDate}</p></div>
                        <div className="kpi-card"><h4>Scope Changes</h4><p className={`value ${openScopeChanges > 0 ? 'amber' : ''}`}>{openScopeChanges} Open</p></div>
                        <div className="kpi-card"><h4>Risk Exposure</h4><p className={`value ${riskExposureClass}`}>{riskExposure}</p></div>
                        <div className="kpi-card">
                            <h4>Next Milestone</h4>
                            <p className="value" style={{ fontSize: nextMilestone?.name.length > 15 ? '1.2rem' : '1.5rem' }}>
                                {nextMilestone ? `${nextMilestone.name} (${new Date(nextMilestone.plannedDate).toLocaleDateString()})` : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="tool-card">
                    <h3 className="subsection-title">Phase Tracker</h3>
                    <div className="phase-tracker">
                        {projectPhases.map((phase) => {
                            const doc = documents.find(d => d.id === phase.docId);
                            const isComplete = doc?.status === 'Approved';
                            const isInProgress = phase.id === inProgressPhase?.id;
                            return (
                                <div
                                    key={phase.id}
                                    className={`phase-tracker-segment ${isComplete ? 'completed' : isInProgress ? 'inprogress' : ''}`}
                                    title={phase.title}
                                />
                            );
                        })}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginTop: '0.5rem' }}>
                        {completedPhases} of {totalPhases} documents approved
                    </p>
                </div>
                <div className="tool-card">
                    <h3 className="subsection-title">Task Completion</h3>
                    <div style={{ width: '100%', height: '30px', backgroundColor: 'var(--background-secondary)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                        <div style={{ width: `${taskCompletionPercent}%`, height: '100%', backgroundColor: 'var(--accent-color)', transition: 'width 0.3s ease' }} />
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', color: taskCompletionPercent > 50 ? 'var(--background-color)' : 'var(--text-color)' }}>
                            {completedTasks} / {totalTasks} ({taskCompletionPercent}%)
                        </div>
                    </div>
                </div>
                <div className="tool-card">
                    <h3 className="subsection-title">Tasks</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                        {project.tasks?.map(task => (
                            <div className="task-card" key={task.id} style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                                <div style={{ fontWeight: 'bold' }}>{task.name}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
                                    {task.status} • Due: {task.endDate}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="tool-grid">
                <div className="tool-card">
                    <h3 className="subsection-title">Alerts</h3>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li style={{ color: overdueTasks > 0 ? 'var(--status-red)' : 'inherit' }}>{overdueTasks} Overdue tasks</li>
                        <li style={{ color: blockedTasks > 0 ? 'var(--status-amber)' : 'inherit' }}>{blockedTasks} Blocked item(s)</li>
                        <li style={{ color: pendingApprovals > 0 ? 'var(--status-amber)' : 'inherit' }}>{pendingApprovals} Pending approvals</li>
                    </ul>
                </div>

                <div className="tool-card">
                    <h3 className="subsection-title">Financial Summary</h3>
                     <div className="financial-summary-grid">
                        <div className="financial-item" title="The total planned budget for the project.">
                            <span>Budget</span>
                            <span className="value">{currencyFormat(budget)}</span>
                        </div>
                        <div className="financial-item" title="Estimate at Completion (EAC): The current projected total cost for the project.">
                            <span>EAC</span>
                            <span className="value">{currencyFormat(estimateAtCompletion)}</span>
                        </div>
                        <div className="financial-item" title="Cost Variance: The difference between Budget and EAC. Negative means over budget.">
                            <span>Cost Variance</span>
                            <span className={`value ${costVarianceClass}`}>{currencyFormat(costVariance)}</span>
                        </div>
                        <div className="financial-item" title="Cost to Date: The total actual costs incurred so far.">
                            <span>Cost to Date</span>
                            <span className="value">{currencyFormat(costToDate)}</span>
                        </div>
                        <hr />
                        <div className="financial-item" title="Total estimated labor cost based on task durations and average burdened rate.">
                            <span>Est. Labor Cost</span>
                            <span className="value">{currencyFormat(totalEstimatedLaborCost)}</span>
                        </div>
                        <div className="financial-item" title="Total estimated non-labor resource costs.">
                            <span>Est. Resource Cost</span>
                            <span className="value">{currencyFormat(totalEstimatedResourceCost)}</span>
                        </div>
                    </div>
                </div>

                <div className="tool-card">
                    <h3 className="subsection-title">Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                         <button className="button button-small" onClick={onAnalyzeRisks} disabled={!!isGeneratingReport}>
                            {isGeneratingReport === 'risk' ? 'Analyzing...' : 'Analyze Project Risks'}
                         </button>
                         <button className="button button-small" onClick={onGenerateSummary} disabled={!!isGeneratingReport}>
                            {isGeneratingReport === 'summary' ? 'Generating...' : 'Generate Project Summary'}
                         </button>
                        <button className="button button-small">Log Risk</button>
                        <button className="button button-small">Add Task</button>
                        <button className="button button-small">Upload Doc</button>
                        <button className="button button-small">Raise Change</button>
                    </div>
                </div>
            </div>
        </div>
    )
};