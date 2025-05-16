
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiresAdmin?: boolean;
}

const ProtectedRoute = ({ children, requiresAdmin = false }: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-travel-gold" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  if (requiresAdmin && !isAdmin) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
