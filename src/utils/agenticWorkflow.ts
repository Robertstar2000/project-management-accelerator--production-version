import { GoogleGenAI } from "@google/genai";
import type { AWSBedrockService } from './awsBedrockService';
import { Task, Project } from '../types';

const MAX_ITERATIONS = 20;

interface AgentMessage {
    agent: string;
    iteration: number;
    preview: string;
}

interface AgentContext {
    task: Task;
    role: string;
    phase1Content: string;
    allDocuments: { title: string; content: string }[];
}

export const runAgenticWorkflow = async (
    ai: GoogleGenAI | AWSBedrockService,
    task: Task,
    project: Project,
    onProgress: (message: AgentMessage) => void,
    onDocumentCreated: (title: string, content: string) => void
): Promise<{ success: boolean; error?: string }> => {
    
    const role = project.team.find(m => m.role === task.role)?.role || 'Team Member';
    const phase1Doc = project.documents.find(d => d.phase === 1);
    const phase1Content = phase1Doc && project.phasesData[phase1Doc.id]?.compactedContent || '';
    
    const allDocuments = project.documents
        .filter(d => project.phasesData[d.id]?.content)
        .map(d => ({
            title: d.title,
            content: project.phasesData[d.id].content
        }));

    const context: AgentContext = { task, role, phase1Content, allDocuments };
    
    let iteration = 0;
    let isComplete = false;
    let currentDocument = '';
    
    while (iteration < MAX_ITERATIONS && !isComplete) {
        iteration++;
        
        // Agent 1: Doer/Controller
        const doerPrompt = `You are a ${role} working on the following task:
Task: ${task.name}
Description: ${task.description || 'No additional description'}

Project Context (Phase 1):
${phase1Content}

Current document draft:
${currentDocument || 'No document yet - create one from scratch'}

Your goal is to create or improve a document that achieves this task. Output the complete document content.`;

        try {
            const doerResult = await ai.models.generateContent({ 
                model: 'gemini-2.5-flash', 
                contents: doerPrompt 
            });
            currentDocument = doerResult.text;
            onProgress({ agent: 'Doer/Controller', iteration, preview: currentDocument.substring(0, 30) });
        } catch (err) {
            return { success: false, error: `Doer agent failed at iteration ${iteration}: ${err}` };
        }

        // Agent 2: Tools Agent (RAG + Document Access)
        const toolsPrompt = `Review this document and provide any additional information or improvements needed.

Available documents:
${allDocuments.map(d => `- ${d.title}`).join('\n')}

Current document:
${currentDocument}

Task: ${task.name}

Provide specific improvements or additional content needed, or respond with "SUFFICIENT" if the document is complete.`;

        let toolsResponse = '';
        try {
            const toolsResult = await ai.models.generateContent({ 
                model: 'gemini-2.5-flash', 
                contents: toolsPrompt 
            });
            toolsResponse = toolsResult.text;
            onProgress({ agent: 'Tools', iteration, preview: toolsResponse.substring(0, 30) });
        } catch (err) {
            return { success: false, error: `Tools agent failed at iteration ${iteration}: ${err}` };
        }

        // Agent 3: Tester
        const testerPrompt = `Evaluate if this document successfully completes the task.

Task: ${task.name}
Role: ${role}

Document:
${currentDocument}

Tools Agent Feedback:
${toolsResponse}

Respond with either:
- "COMPLETE" if the task is fully achieved
- A specific list of what still needs to be done`;

        try {
            const testerResult = await ai.models.generateContent({ 
                model: 'gemini-2.5-flash', 
                contents: testerPrompt 
            });
            const testerResponse = testerResult.text.trim();
            onProgress({ agent: 'Tester', iteration, preview: testerResponse.substring(0, 30) });
            
            if (testerResponse.toUpperCase().includes('COMPLETE')) {
                isComplete = true;
                onDocumentCreated(`${task.name} - Output`, currentDocument);
            } else {
                // Loop continues with feedback
                currentDocument += `\n\n[Feedback for next iteration: ${testerResponse}]`;
            }
        } catch (err) {
            return { success: false, error: `Tester agent failed at iteration ${iteration}: ${err}` };
        }
    }
    
    if (!isComplete) {
        return { 
            success: false, 
            error: `Agent reached ${MAX_ITERATIONS} iterations without completing the task. The agent requires help to complete this task. Please review and complete manually.` 
        };
    }
    
    return { success: true };
};
