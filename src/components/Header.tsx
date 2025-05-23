import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldCheck, Bookmark } from "lucide-react";
import MobileNav from "./MobileNav";
import { motion } from "framer-motion";
import AdminNotificationCenter from "./admin/AdminNotificationCenter";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

// Define the NavItem type to properly include the optional isAdmin property
type NavItem = {
  title: string;
  href: string;
  isAdmin?: boolean;
};

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Base navigation items
  const navItems: NavItem[] = [
    { title: "Home", href: "/" },
    { title: "About", href: "/about" },
    { title: "Destinations", href: "/destinations" },
    { title: "Blog", href: "/blog" },
    { title: "Contact", href: "/contact" },
  ];
  
  // Add My Trips for logged in users
  const userNavItems: NavItem[] = user ? [
    ...navItems,
    { title: "My Trips", href: "/my-trips" }
  ] : navItems;
  
  // Add Admin link for admins
  const fullNavItems: NavItem[] = isAdmin ? [
    ...userNavItems,
    { title: "Admin", href: "/admin", isAdmin: true },
  ] : userNavItems;

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
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {fullNavItems.filter(item => !item.isAdmin || isAdmin).map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              <Link
                to={item.href}
                className={`text-sm font-medium hover:text-travel-gold transition-colors animated-link after:bg-travel-gold ${
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
            className="flex items-center space-x-2"
          >
            {!user ? (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="border-travel-gold text-travel-gold hover:bg-travel-gold/10 hover-scale">
                  Login
                </Button>
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                {isAdmin && <AdminNotificationCenter />}
                
                {isAdmin && (
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger className="text-travel-gold hover:bg-travel-gold/10">
                          <ShieldCheck className="h-4 w-4 mr-1" />
                          <span className="sr-only md:not-sr-only">Admin</span>
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[200px] gap-3 p-4">
                            <li>
                              <Link 
                                to="/admin"
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium leading-none">Dashboard</div>
                              </Link>
                            </li>
                            <li>
                              <Link 
                                to="/admin/contact-messages"
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium leading-none">Contact Messages</div>
                              </Link>
                            </li>
                            <li>
                              <Link 
                                to="/admin/bookings"
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium leading-none">Bookings</div>
                              </Link>
                            </li>
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
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
          {isAdmin && user && <AdminNotificationCenter />}
          <ThemeToggle />
          <MobileNav navLinks={fullNavItems} />
        </div>
      </div>
    </header>
  );
};

export default Header;
