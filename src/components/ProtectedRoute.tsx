import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-admin-bg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
}
