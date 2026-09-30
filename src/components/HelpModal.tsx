import React, { useState, useEffect, useMemo } from 'react';
import { parseMarkdown } from '../utils/markdownParser';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            fetch('helpme.md')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(text => {
                    setContent(text);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching help content:', error);
                    setContent('Could not load help content. Please try again later.');
                    setIsLoading(false);
                });
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const parsedContent = useMemo(() => parseMarkdown(content), [content]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content help-modal-content"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="help-modal-title"
                tabIndex={-1}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <h2 id="help-modal-title" style={{ margin: 0 }}>Help & Documentation</h2>
                    <button type="button" onClick={onClose} className="button-close" aria-label="Close">&times;</button>
                </div>
                <div className="help-modal-body">
                    {isLoading ? <p>Loading help...</p> : parsedContent}
                </div>
                <div className="modal-actions">
                    <button type="button" className="button button-primary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};