
import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface BookingAuthWrapperProps {
  children: ReactNode;
  destinationId: number;
  destinationName: string;
}

const BookingAuthWrapper = ({ children, destinationId, destinationName }: BookingAuthWrapperProps) => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

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
      <div className="p-8 rounded-md bg-white shadow-sm border border-muted">
        <h3 className="text-2xl font-semibold mb-4 text-center">Authentication Required</h3>
        <p className="mb-6 text-center text-muted-foreground">
          You need to sign in before booking {destinationName}.
        </p>
        
        <div className="flex flex-col gap-4">
          <Button 
            onClick={() => {
              toast({
                title: "Redirecting to login",
                description: "Please log in to continue with your booking."
              });
              
              // Save destination info in sessionStorage for redirect after login
              sessionStorage.setItem('pendingBooking', JSON.stringify({
                id: destinationId,
                name: destinationName
              }));
            }}
            className="w-full bg-travel-gold hover:bg-amber-600 text-black"
            asChild
          >
            <Navigate to="/auth?redirect=booking" />
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => {
              toast({
                title: "Booking cancelled",
                description: "You've been returned to the destinations page."
              });
            }}
            className="w-full"
            asChild
          >
            <Navigate to="/destinations" />
          </Button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default BookingAuthWrapper;
