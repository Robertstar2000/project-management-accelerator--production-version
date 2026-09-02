import React, { useState, useEffect } from 'react';

interface ResetPasswordViewProps {
    token: string | null;
    onSuccess: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ token, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/auth/confirm-reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => onSuccess(), 3000);
            } else {
                setError('Invalid or expired reset link');
            }
        } catch (err) {
            setError('Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem' }}>
                <div className="tool-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <h2 className="subsection-title" style={{ color: 'var(--accent-color)' }}>Success!</h2>
                    <p>Your password has been successfully reset.</p>
                    <p style={{ color: 'var(--secondary-text)', marginTop: '1rem' }}>Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem' }}>
            <div className="tool-card" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="subsection-title">Reset Password</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="status-message error" style={{ marginBottom: '1rem' }}>{error}</p>}
                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                            minLength={6}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input 
                            type="password" 
                            id="confirmPassword" 
                            value={confirmPassword} 
                            onChange={e => setConfirmPassword(e.target.value)} 
                            required 
                            minLength={6}
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="button button-primary" 
                        style={{ width: '100%' }}
                        disabled={isLoading || !token}
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};
