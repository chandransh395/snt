
import { ReactNode, Suspense, lazy, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PageTransition from "./PageTransition";
import SecurityHeaders from "./SecurityHeaders";
import { useIsMobile } from "@/hooks/use-mobile";

// Define loading fallbacks
const LoadingFallback = () => (
  <div className="flex items-center justify-center w-full h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-travel-gold"></div>
  </div>
);

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  
  // Add playful animations on page scroll
  useEffect(() => {
    // Fade in elements as they appear in viewport
    const animateOnScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top <= window.innerHeight * 0.85;
        
        if (isVisible) {
          element.classList.add('fadeIn');
        }
      });
    };
    
    // Add playful cursor effect (desktop only)
    const addCursorEffect = () => {
      if (isMobile) return;
      
      const cursor = document.createElement('div');
      cursor.classList.add('playful-cursor');
      cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: rgba(219, 161, 28, 0.5);
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: transform 0.1s;
        opacity: 0;
      `;
      document.body.appendChild(cursor);
      
      document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursor.style.opacity = '1';
      });
      
      document.addEventListener('mousedown', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
      });
      
      document.addEventListener('mouseup', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      });
      
      document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
      });
      
      // Clean up
      return () => {
        document.body.removeChild(cursor);
      };
    };
    
    // Initialize animations
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);
    
    // Add cursor effect
    const cleanupCursor = addCursorEffect();
    
    return () => {
      window.removeEventListener('scroll', animateOnScroll);
      if (cleanupCursor) cleanupCursor();
    };
  }, [isMobile]);

  return (
    <>
      <SecurityHeaders />
      <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden bg-background">
        <Header />
        <main className="flex-grow pt-16 w-full">
          <Suspense fallback={<LoadingFallback />}>
            <PageTransition>{children}</PageTransition>
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
