
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const navigate = useNavigate();
  
  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="text-center">
        <h1 className="font-playfair text-6xl md:text-8xl font-bold mb-4">404</h1>
        <h2 className="text-xl md:text-3xl font-bold mb-6">Page Not Found</h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button onClick={handleBack} variant="outline" className="border-travel-gold hover:bg-travel-gold/10 text-foreground">
            Go Back
          </Button>
          <Button asChild className="bg-travel-gold hover:bg-amber-600 text-black">
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
