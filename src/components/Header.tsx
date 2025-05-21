
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldCheck, BadgeCheck } from "lucide-react";
import MobileNav from "./MobileNav";
import { motion } from "framer-motion";

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
        ? "bg-background/90 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800" 
        : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-5 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="z-50"
        >
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl sm:text-3xl font-playfair font-bold tracking-wider">
              Seeta<span className="text-travel-gold">Narayan</span>
            </h1>
            {isAdmin && (
              <div className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded text-xs flex items-center">
                <BadgeCheck className="h-3 w-3 mr-0.5" />
                Verified
              </div>
            )}
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-10">
          {navItems.filter(item => !item.isAdmin || isAdmin).map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              <Link
                to={item.href}
                className={`text-sm font-medium hover:text-travel-gold transition-colors animated-link ${
                  location.pathname === item.href ? "text-travel-gold after:scale-x-100" : ""
                }`}
              >
                {item.title}
              </Link>
            </motion.div>
          ))}
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * navItems.length }}
          >
            {!user ? (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="border-travel-gold text-travel-gold hover:bg-travel-gold/10">
                  Login
                </Button>
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="px-2 text-travel-gold hover:bg-travel-gold/10">
                      <ShieldCheck className="h-4 w-4 mr-1" />
                      <span className="sr-only md:not-sr-only">Admin</span>
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="px-2 hover:bg-red-500/10 hover:text-red-500"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="sr-only md:not-sr-only">Logout</span>
                </Button>
              </div>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 + 0.1 * navItems.length }}
          >
            <ThemeToggle />
          </motion.div>
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
