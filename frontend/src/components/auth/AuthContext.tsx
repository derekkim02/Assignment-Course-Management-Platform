import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    userRole: string;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [userRole, setRole] = useState('marker');

    const login = () => {
        setIsAuthenticated(true);
    };

    const logout = () => {
        // Todo: implement logout logic from backend.
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, userRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};