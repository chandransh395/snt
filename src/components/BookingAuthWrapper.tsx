
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

interface BookingAuthWrapperProps {
  children: ReactNode;
  destinationId: number;
  destinationName: string;
}

const BookingAuthWrapper = ({ children, destinationId, destinationName }: BookingAuthWrapperProps) => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user && !redirecting) {
      setRedirecting(true);
      
      // Save destination info in sessionStorage for redirect after login
      sessionStorage.setItem('pendingBooking', JSON.stringify({
        id: destinationId,
        name: destinationName
      }));

      toast({
        title: "Authentication Required",
        description: "Please log in to continue with your booking.",
        duration: 5000,
      });

      // Redirect to login page
      navigate('/auth?redirect=booking');
    }
  }, [user, isLoading, destinationId, destinationName, navigate, toast, redirecting]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-8 rounded-md bg-white shadow-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-travel-gold mx-auto mb-4"></div>
          <p>Checking authentication status...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="p-8 rounded-md bg-white shadow-sm">
        <div className="text-center">
          <h3 className="text-xl font-medium mb-2">Authentication Required</h3>
          <p className="mb-4">You need to be logged in to book this trip.</p>
          <p className="text-sm text-muted-foreground">Redirecting you to the login page...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default BookingAuthWrapper;
