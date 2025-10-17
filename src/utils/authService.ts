import * as backendAuth from './be-authService';
import { User } from '../types';

export const register = async (username: string, email: string, password: string): Promise<User | null> => {
    return await backendAuth.register(username, email, password);
};

export const login = async (email: string, password: string): Promise<User | null> => {
    return await backendAuth.login(email, password);
};

export const logout = (): void => {
    return backendAuth.logout();
};

export const getCurrentUser = (): User | null => {
    return backendAuth.getCurrentUser();
};
