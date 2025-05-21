
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldCheck } from "lucide-react";
import MobileNav from "./MobileNav";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { title: "Home", href: "/" },
    { title: "About", href: "/about" },
    { title: "Destinations", href: "/destinations" },
    { title: "Blog", href: "/blog" },
    { title: "Contact", href: "/contact" },
    { title: "Admin", href: "/admin", isAdmin: true },
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
          {navItems.filter(item => !item.isAdmin || isAdmin).map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className={`text-sm font-medium hover:text-travel-gold transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-travel-gold after:transition-all after:duration-300 hover:after:w-full ${
                location.pathname === item.href ? "text-travel-gold after:w-full" : ""
              }`}
            >
              {item.title}
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

        {/* Mobile Navigation */}
        <div className="flex items-center md:hidden space-x-3">
          <ThemeToggle />
          <MobileNav navLinks={navItems} />
        </div>
      </div>
    </header>
  );
};

export default Header;
