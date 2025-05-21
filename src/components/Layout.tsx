
import { ReactNode, Suspense, lazy } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PageTransition from "./PageTransition";
import SecurityHeaders from "./SecurityHeaders";

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
