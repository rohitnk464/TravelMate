"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthUser {
    id: string;
    _id?: string;
    name: string;
    email?: string;
    role: 'USER' | 'GUIDE' | 'ADMIN';
    profileImage?: string;
    isVerified?: boolean;
    trustedContacts?: { name: string; phone: string }[];
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (userData: AuthUser, authToken: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedToken) setToken(storedToken);
    }, []);

    const login = (userData: AuthUser, authToken: string) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', authToken);
        setUser(userData);
        setToken(authToken);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuthContext must be used within AuthProvider');
    return context;
};
