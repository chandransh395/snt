
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, ShieldCheck, Menu, X } from "lucide-react";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Destinations", path: "/destinations" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
        ? "bg-background/80 backdrop-blur-md shadow-sm" 
        : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-5 flex items-center justify-between">
        <Link to="/" className="z-50">
          <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-wider">
            Seeta<span className="text-travel-gold">Narayan</span>
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-10">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`text-sm font-medium hover:text-travel-gold transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-travel-gold after:transition-all after:duration-300 hover:after:w-full ${
                location.pathname === item.path ? "text-travel-gold after:w-full" : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
          
          {!user ? (
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="px-2">
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    <span className="sr-only md:not-sr-only">Admin</span>
                  </Button>
                </Link>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                className="px-2"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="sr-only md:not-sr-only">Logout</span>
              </Button>
            </div>
          )}
          
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="flex items-center md:hidden space-x-4">
          {user && (
            <Button 
              variant="ghost" 
              size="sm"
              className="px-2"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>
          )}
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-foreground focus:outline-none z-50"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`fixed inset-0 z-40 bg-background transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col h-full justify-center items-center space-y-8 pt-16">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-xl font-medium hover:text-travel-gold transition-colors ${
                  location.pathname === item.path ? "text-travel-gold" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {!user ? (
              <Link to="/auth" className="w-full flex justify-center" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-32">Login</Button>
              </Link>
            ) : (
              <>
                {isAdmin && (
                  <Link to="/admin" className="w-full flex justify-center" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-32">
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
