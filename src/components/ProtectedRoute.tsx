
import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiresAdmin?: boolean;
}

const ProtectedRoute = ({ children, requiresAdmin = false }: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin } = useAuth();
  // Use state to track rendering conditions
  const [shouldRender, setShouldRender] = useState<'loading' | 'redirect-to-auth' | 'redirect-to-home' | 'render'>('loading');
  
  useEffect(() => {
    // Determine what to render based on auth state
    if (!isLoading) {
      if (!user) {
        setShouldRender('redirect-to-auth');
      } else if (requiresAdmin && !isAdmin) {
        setShouldRender('redirect-to-home');
      } else {
        setShouldRender('render');
      }
    }
  }, [isLoading, user, isAdmin, requiresAdmin]);
  
  // Always render something based on state, avoiding conditional hooks
  if (shouldRender === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-travel-gold" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (shouldRender === 'redirect-to-auth') {
    return <Navigate to="/auth" />;
  }
  
  if (shouldRender === 'redirect-to-home') {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
