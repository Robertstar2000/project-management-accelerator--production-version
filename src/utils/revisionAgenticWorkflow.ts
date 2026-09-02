import { GoogleGenAI } from "@google/genai";
import type { AWSBedrockService } from './awsBedrockService';
import { Project } from '../types';

const MAX_ITERATIONS = 50;

interface AgentMessage {
    agent: string;
    iteration: number;
    preview: string;
}

export const runRevisionAgenticWorkflow = async (
    ai: GoogleGenAI | AWSBedrockService,
    changeRequest: { title: string; reason: string; impactStr: string },
    project: Project,
    onProgress: (message: AgentMessage) => void,
    onDocumentUpdate: (docId: string, newContent: string, newCompactedContent: string) => void,
    onResetDocStatus: (docId: string) => void
): Promise<{ success: boolean; error?: string }> => {
    
    const allDocuments = project.documents
        .filter(d => project.phasesData[d.id]?.content)
        .map(d => ({
            id: d.id,
            title: d.title,
            content: project.phasesData[d.id].content,
            compactedContent: project.phasesData[d.id].compactedContent || ''
        }));

    let iteration = 0;
    let isComplete = false;
    let documentsToChange: { docId: string; changes: string }[] = [];
    let currentDocIndex = 0;
    
    while (iteration < MAX_ITERATIONS && !isComplete) {
        iteration++;
        
        // Agent 1: Change Agent - Identify documents needing changes
        if (documentsToChange.length === 0) {
            const changeAgentPrompt = `You are analyzing a change request for a project.

Change Request: ${changeRequest.title}
Reason: ${changeRequest.reason}

Available Documents:
${allDocuments.map((d, i) => `${i + 1}. ${d.title}`).join('\n')}

Identify which documents need changes to implement this change request. For each document, specify the minimal changes needed.

Respond in this format:
DOCUMENT: [Document Title]
CHANGES: [Specific changes needed]

DOCUMENT: [Next Document Title]
CHANGES: [Specific changes needed]

Or respond with "NO_CHANGES_NEEDED" if the change request doesn't require document updates.`;

            try {
                const result = await ai.models.generateContent({ 
                    model: 'gemini-2.5-flash', 
                    contents: changeAgentPrompt 
                });
                const response = result.text;
                onProgress({ agent: 'ChangeAgent', iteration, preview: response.substring(0, 30) });
                
                if (response.includes('NO_CHANGES_NEEDED')) {
                    isComplete = true;
                    continue;
                }
                
                // Parse response to extract documents and changes
                const docMatches = response.matchAll(/DOCUMENT:\s*(.+?)\s*CHANGES:\s*(.+?)(?=DOCUMENT:|$)/gs);
                for (const match of docMatches) {
                    const docTitle = match[1].trim();
                    const changes = match[2].trim();
                    const doc = allDocuments.find(d => d.title.toLowerCase().includes(docTitle.toLowerCase()));
                    if (doc) {
                        documentsToChange.push({ docId: doc.id, changes });
                    }
                }
                
                if (documentsToChange.length === 0) {
                    isComplete = true;
                }
            } catch (err) {
                return { success: false, error: `ChangeAgent failed at iteration ${iteration}: ${err}` };
            }
            continue;
        }
        
        // Agent 2: RevisionTool Agent - Apply changes to documents
        if (currentDocIndex < documentsToChange.length) {
            const docToChange = documentsToChange[currentDocIndex];
            const doc = allDocuments.find(d => d.id === docToChange.docId);
            
            if (!doc) {
                currentDocIndex++;
                continue;
            }
            
            const revisionToolPrompt = `You are updating a document based on a change request.

Change Request: ${changeRequest.title}
Reason: ${changeRequest.reason}

Document: ${doc.title}
Current Content:
${doc.content}

Required Changes:
${docToChange.changes}

Provide the COMPLETE updated document content with the minimal changes applied.`;

            try {
                const result = await ai.models.generateContent({ 
                    model: 'gemini-2.5-flash', 
                    contents: revisionToolPrompt 
                });
                const updatedContent = result.text;
                onProgress({ agent: 'RevisionTool', iteration, preview: updatedContent.substring(0, 30) });
                
                // Compact the updated content
                const compactPrompt = `Summarize this document content into key points for context in future operations:\n\n${updatedContent.substring(0, 15000)}`;
                const compactResult = await ai.models.generateContent({ 
                    model: 'gemini-2.5-flash', 
                    contents: compactPrompt 
                });
                const compactedContent = compactResult.text;
                
                // Update document and reset status
                onDocumentUpdate(doc.id, updatedContent, compactedContent);
                onResetDocStatus(doc.id);
                
                currentDocIndex++;
            } catch (err) {
                return { success: false, error: `RevisionTool failed at iteration ${iteration}: ${err}` };
            }
            continue;
        }
        
        // Agent 3: QA Agent - Verify changes are appropriate
        const qaPrompt = `You are verifying that document changes align with the change request.

Change Request: ${changeRequest.title}
Reason: ${changeRequest.reason}

Documents Changed:
${documentsToChange.map(d => {
    const doc = allDocuments.find(ad => ad.id === d.docId);
    return `- ${doc?.title}: ${d.changes}`;
}).join('\n')}

Are these changes:
1. Necessary for the change request?
2. Directly related to the change request?
3. Minimal and appropriate?

Respond with "APPROVED" if all changes are appropriate, or list specific concerns.`;

        try {
            const result = await ai.models.generateContent({ 
                model: 'gemini-2.5-flash', 
                contents: qaPrompt 
            });
            const response = result.text;
            onProgress({ agent: 'QA', iteration, preview: response.substring(0, 30) });
            
            if (response.toUpperCase().includes('APPROVED')) {
                isComplete = true;
            } else {
                // QA has concerns, loop back
                documentsToChange = [];
                currentDocIndex = 0;
            }
        } catch (err) {
            return { success: false, error: `QA Agent failed at iteration ${iteration}: ${err}` };
        }
    }
    
    if (!isComplete) {
        return { 
            success: false, 
            error: `Revision workflow reached ${MAX_ITERATIONS} iterations without completing. Manual review required.` 
        };
    }
    
    return { success: true };
};
