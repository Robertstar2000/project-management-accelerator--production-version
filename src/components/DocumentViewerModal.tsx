import React, { useEffect, useRef } from 'react';
import { parseMarkdown } from '../utils/markdownParser';

interface DocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ isOpen, onClose, title, content }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => modalRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const parsedContent = parseMarkdown(content || 'No content available for this document.');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                style={{ maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
                onClick={e => e.stopPropagation()}
                ref={modalRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="document-viewer-title"
            >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0}}>
                    <h2 id="document-viewer-title" style={{ margin: 0 }}>{title}</h2>
                    <button type="button" onClick={onClose} className="button-close" aria-label="Close document">&times;</button>
                </div>
                
                <div className="display-content" style={{ flexGrow: 1, overflowY: 'auto', background: 'var(--background-color)', padding: '1.5rem', borderRadius: '4px', border: '1px solid var(--border-color)'}}>
                    {parsedContent}
                </div>
                
                <div className="modal-actions" style={{justifyContent: 'flex-end', flexShrink: 0, paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)'}}>
                    <button type="button" className="button button-primary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};
