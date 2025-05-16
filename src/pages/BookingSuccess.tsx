
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const BookingSuccess = () => {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="h-24 w-24 text-green-500" />
        </div>
        
        <h1 className="text-4xl font-bold mb-6">Booking Request Successful!</h1>
        
        <div className="prose prose-lg dark:prose-invert mx-auto mb-10">
          <p>
            Thank you for booking with Seeta Narayan Travels. Your booking request has been 
            successfully submitted and is currently being processed by our team.
          </p>
          
          <p>
            You will receive a confirmation email shortly with further details about your booking. 
            Our travel experts may contact you to discuss any specific requirements or to provide 
            additional information about your destination.
          </p>
          
          <p>
            If you have any questions or need immediate assistance, please don't hesitate to 
            contact us directly.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-travel-gold hover:bg-amber-600 text-black">
            <Link to="/contact">Contact Us</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Return to Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
