import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { insforge } from '../lib/insforge';

interface User {
    id: string;
    email: string;
    profile?: {
        name?: string;
        avatar_url?: string;
    };
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ error?: string }>;
    register: (email: string, password: string, name: string) => Promise<{ error?: string, requireEmailVerification?: boolean }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkSession();
    }, []);

    async function checkSession() {
        try {
            const { data } = await insforge.auth.getCurrentSession();
            if (data?.session?.user) {
                setUser(data.session.user as User);
            }
        } catch {
            // No session
        } finally {
            setIsLoading(false);
        }
    }

    async function login(email: string, password: string) {
        const { data, error } = await insforge.auth.signInWithPassword({ email, password });
        if (error) {
            return { error: error.message || 'Invalid credentials' };
        }
        if (data?.user) {
            setUser(data.user as User);
        }
        return {};
    }

    async function register(email: string, password: string, name: string) {
        const { data, error } = await insforge.auth.signUp({ email, password, name });
        if (error) {
            return { error: error.message || 'Error creating account' };
        }
        // If email verification is NOT required and we get an access token, we are logged in
        if (!data?.requireEmailVerification && data?.user) {
            setUser(data.user as User);
        }
        return { requireEmailVerification: data?.requireEmailVerification };
    }

    async function logout() {
        await insforge.auth.signOut();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
