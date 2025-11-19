import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'student' | 'admin' | null;

interface User {
  name: string;
  email: string;
  role: UserRole;
  rollNo?: string;
  branch?: string;
  semester?: string;
  username?: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, userData: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole, userData: Partial<User>) => {
    const newUser: User = {
      name: userData.name || (role === 'student' ? 'John Doe' : 'Admin User'),
      email: userData.email || (role === 'student' ? 'student@college.edu' : 'admin@college.edu'),
      role: role,
      rollNo: userData.rollNo || '2021CS001',
      branch: userData.branch || 'Computer Science',
      semester: userData.semester || '6th',
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, updateUser }}>
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
