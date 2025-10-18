
import React, { useState } from 'react';
import * as authService from '../utils/authService';
import { User } from '../types';

interface AuthViewProps {
    onLogin: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
    const [viewMode, setViewMode] = useState<'login' | 'signup' | 'reset'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        try {
            if (viewMode === 'login') {
                const user = await authService.login(email, password);
                if (user) {
                    onLogin(user);
                } else {
                    setError('Invalid email or password.');
                }
            } else if (viewMode === 'signup') {
                const newUser = await authService.register(username, email, password);
                if (newUser) {
                    onLogin(newUser);
                } else {
                    setError('Username or email already exists.');
                }
            } else if (viewMode === 'reset') {
                const success = await authService.requestPasswordReset(email);
                if (success) {
                    setSuccessMessage('Password reset email sent. Check your inbox.');
                } else {
                    setError('Failed to send reset email. Please try again.');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Operation failed. Is the backend running?');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem' }}>
            <div className="tool-card" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="subsection-title">{viewMode === 'login' ? 'Login' : viewMode === 'signup' ? 'Sign Up' : 'Reset Password'}</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="status-message error" style={{ marginBottom: '1rem' }}>{error}</p>}
                    {successMessage && <p className="status-message" style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>{successMessage}</p>}
                    {viewMode === 'signup' && (
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} required />
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    {viewMode !== 'reset' && (
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                    )}
                    <button type="submit" className="button button-primary" style={{ width: '100%', marginBottom: '1rem' }}>
                        {viewMode === 'login' ? 'Login' : viewMode === 'signup' ? 'Sign Up' : 'Send Reset Email'}
                    </button>
                    {viewMode === 'login' && (
                        <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <button type="button" onClick={() => { setViewMode('reset'); setError(''); setSuccessMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}>
                                Forgot Password?
                            </button>
                        </p>
                    )}
                    <p style={{ textAlign: 'center', color: 'var(--secondary-text)' }}>
                        {viewMode === 'login' ? "Don't have an account?" : viewMode === 'signup' ? "Already have an account?" : "Remember your password?"}
                        <button type="button" onClick={() => { setViewMode(viewMode === 'login' ? 'signup' : 'login'); setError(''); setSuccessMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit', marginLeft: '0.5rem' }}>
                            {viewMode === 'login' ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};
