import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'parent' | 'child';
  parentId?: string;
  children?: string[]; // Array of child user IDs
  name?: string;
  age?: number;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: 'parent' | 'child', parentId?: string) => Promise<void>;
  logout: () => Promise<void>;
  addChild: (childEmail: string, childName: string, childAge: number) => Promise<void>;
  getChildren: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load users from localStorage
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }

    // Check for existing user in localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const login = async (email: string, password: string) => {
    try {
      const user = users.find(u => u.email === email);
      if (!user) {
        throw new Error('User not found');
      }
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, role: 'parent' | 'child', parentId?: string) => {
    try {
      if (users.some(u => u.email === email)) {
        throw new Error('Email already registered');
      }

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        role,
        parentId,
        children: role === 'parent' ? [] : undefined,
      };

      const updatedUsers = [...users, newUser];
      saveUsers(updatedUsers);

      if (role === 'child' && parentId) {
        // Update parent's children array
        const parent = updatedUsers.find(u => u.id === parentId);
        if (parent) {
          parent.children = [...(parent.children || []), newUser.id];
          saveUsers(updatedUsers);
        }
      }

      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    } catch (error) {
      throw error;
    }
  };

  const addChild = async (childEmail: string, childName: string, childAge: number) => {
    if (!currentUser || currentUser.role !== 'parent') {
      throw new Error('Only parents can add children');
    }

    try {
      const newChild: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: childEmail,
        role: 'child',
        parentId: currentUser.id,
        name: childName,
        age: childAge,
      };

      const updatedUsers = [...users, newChild];
      currentUser.children = [...(currentUser.children || []), newChild.id];
      
      saveUsers(updatedUsers);
      setCurrentUser({ ...currentUser });
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } catch (error) {
      throw error;
    }
  };

  const getChildren = () => {
    if (!currentUser || currentUser.role !== 'parent') {
      return [];
    }
    return users.filter(user => user.parentId === currentUser.id);
  };

  const logout = async () => {
    try {
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
    } catch (error) {
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    addChild,
    getChildren,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 