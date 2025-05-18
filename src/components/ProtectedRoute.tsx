
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
  const [showContent, setShowContent] = useState<ReactNode | null>(null);
  
  // Always initialize all hooks first before any conditional logic
  useEffect(() => {
    if (isLoading) {
      setShowContent(
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-travel-gold" />
            <p className="text-lg text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    } else if (!user) {
      setShowContent(<Navigate to="/auth" />);
    } else if (requiresAdmin && !isAdmin) {
      // Don't redirect admins away from admin panel
      setShowContent(<Navigate to="/" />);
    } else {
      setShowContent(children);
    }
  }, [isLoading, user, isAdmin, requiresAdmin, children]);
  
  // Always return something from the component
  return <>{showContent}</>;
};

export default ProtectedRoute;
