import { User } from '../types';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const SESSION_KEY = 'hmap-session';

export const register = async (username: string, email: string, password: string): Promise<User | null> => {
    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        if (!response.ok) return null;
        const user = await response.json();
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return user;
    } catch {
        return null;
    }
};

export const login = async (email: string, password: string): Promise<User | null> => {
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) return null;
        const user = await response.json();
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return user;
    } catch {
        return null;
    }
};

export const logout = () => {
    localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
    try {
        const session = localStorage.getItem(SESSION_KEY);
        return session ? JSON.parse(session) : null;
    } catch {
        return null;
    }
};

export const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        return response.ok;
    } catch {
        return false;
    }
};

export const deleteAccount = async (userId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/api/auth/delete-account/${userId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            logout();
            return true;
        }
        return false;
    } catch {
        return false;
    }
};
