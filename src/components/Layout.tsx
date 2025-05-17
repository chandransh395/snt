
import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PageTransition from "./PageTransition";
import SecurityHeaders from "./SecurityHeaders";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <SecurityHeaders />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-16">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
