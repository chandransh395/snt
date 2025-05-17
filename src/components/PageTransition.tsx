
import { ReactNode, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fadeOut");
      
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("fadeIn");
      }, 300); // Match with CSS transition duration
      
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation]);

  return (
    <div
      className={`${
        transitionStage === "fadeIn" 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-4"
      } transition-all duration-300 ease-in-out min-h-screen will-change-transform`}
    >
      {children}
    </div>
  );
};

export default PageTransition;
