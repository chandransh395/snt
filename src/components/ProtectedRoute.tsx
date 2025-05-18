
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
      // Don't redirect away if there's an admin mismatch,
      // show an appropriate error message instead
      setShowContent(
        <div className="flex h-screen items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-red-600 mb-3">Access Restricted</h2>
            <p className="text-gray-700 mb-4">
              You don't have admin permissions to access this area.
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-travel-gold text-black rounded hover:bg-amber-600 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    } else {
      setShowContent(children);
    }
  }, [isLoading, user, isAdmin, requiresAdmin, children]);
  
  // Always return something from the component
  return <>{showContent}</>;
};

export default ProtectedRoute;
