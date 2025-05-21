
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface PublicRouteProps {
  children: ReactNode;
  redirectAuthenticatedTo?: string;
}

const PublicRoute = ({ children, redirectAuthenticatedTo = "/" }: PublicRouteProps) => {
  const { user, isLoading } = useAuth();
  const [showContent, setShowContent] = useState<ReactNode | null>(null);
  const location = useLocation();
  
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
    } else if (user && redirectAuthenticatedTo) {
      // Check for pending booking redirection
      const searchParams = new URLSearchParams(location.search);
      const isBookingRedirect = searchParams.get('redirect') === 'booking';
      const pendingBooking = sessionStorage.getItem('pendingBooking');
      
      if (isBookingRedirect && pendingBooking) {
        try {
          const bookingData = JSON.parse(pendingBooking);
          setShowContent(<Navigate to={`/book/${bookingData.id}`} replace />);
        } catch (error) {
          console.error('Error parsing pending booking data:', error);
          setShowContent(<Navigate to={redirectAuthenticatedTo} replace />);
        }
      } else {
        setShowContent(<Navigate to={redirectAuthenticatedTo} replace />);
      }
    } else {
      // Show the children (login/signup form)
      setShowContent(children);
    }
  }, [isLoading, user, redirectAuthenticatedTo, children, location.search]);
  
  return <>{showContent}</>;
};

export default PublicRoute;
