import React, { useState } from 'react';
import * as authService from '../utils/authService';
import { User } from '../types';

interface AccountSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    onAccountDeleted: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose, currentUser, onAccountDeleted }) => {
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleDeleteAccount = async () => {
        if (confirmText !== 'DELETE') {
            setError('Please type DELETE to confirm');
            return;
        }

        setIsDeleting(true);
        setError('');

        try {
            const success = await authService.deleteAccount(currentUser.id);
            if (success) {
                onAccountDeleted();
            } else {
                setError('Failed to delete account. Please try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Account Settings</h2>
                
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--secondary-text)', fontSize: '1rem', marginBottom: '0.5rem' }}>Account Information</h3>
                    <p><strong>Username:</strong> {currentUser.username}</p>
                    <p><strong>Email:</strong> {currentUser.email}</p>
                </div>

                <div style={{ padding: '1.5rem', background: 'var(--error-background)', border: '1px solid var(--error-color)', borderRadius: '8px' }}>
                    <h3 style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>Delete Account</h3>
                    <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                        This will permanently delete your account, remove all credentials from our servers and Stripe, and clear all local data. This action cannot be undone.
                    </p>
                    
                    {error && <p className="status-message error" style={{ marginBottom: '1rem' }}>{error}</p>}
                    
                    <div className="form-group">
                        <label htmlFor="confirm-delete">Type <strong>DELETE</strong> to confirm:</label>
                        <input 
                            type="text" 
                            id="confirm-delete" 
                            value={confirmText} 
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="DELETE"
                        />
                    </div>
                    
                    <button 
                        onClick={handleDeleteAccount} 
                        className="button" 
                        style={{ background: 'var(--error-color)', color: 'white' }}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete My Account'}
                    </button>
                </div>

                <div className="modal-actions" style={{ marginTop: '2rem' }}>
                    <button onClick={onClose} className="button">Close</button>
                </div>
            </div>
        </div>
    );
};
