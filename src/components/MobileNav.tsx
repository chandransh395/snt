
import * as React from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Menu, X, User, LogOut, Home, Info, Map, BookOpen, 
  MessageSquare, ShieldCheck 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  navLinks: Array<{
    title: string;
    href: string;
    isAdmin?: boolean;
    icon?: React.ReactNode;
  }>;
}

const MobileNav = ({ navLinks }: MobileNavProps) => {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  
  // Enhanced navigation links with icons
  const enhancedNavLinks = navLinks.map(link => {
    let icon;
    
    // Assign appropriate icon based on link title or href
    switch(link.href) {
      case '/':
        icon = <Home className="h-5 w-5 mr-3" />;
        break;
      case '/about':
        icon = <Info className="h-5 w-5 mr-3" />;
        break;
      case '/destinations':
        icon = <Map className="h-5 w-5 mr-3" />;
        break;
      case '/blog':
        icon = <BookOpen className="h-5 w-5 mr-3" />;
        break;
      case '/contact':
        icon = <MessageSquare className="h-5 w-5 mr-3" />;
        break;
      case '/admin':
      case '/admin/destinations':
      case '/admin/blog':
      case '/admin/settings':
      case '/admin/bookings':
        icon = <ShieldCheck className="h-5 w-5 mr-3" />;
        break;
      default:
        icon = link.icon || null;
    }
    
    return {
      ...link,
      icon
    };
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] flex flex-col">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="font-bold text-lg">Menu</div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <nav className="flex flex-col gap-2 mt-6 flex-1">
          {enhancedNavLinks.map((link) => {
            // Skip admin links for non-admin users
            if (link.isAdmin && !isAdmin) return null;
            
            const isActive = location.pathname === link.href;
            
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center py-3 px-4 text-lg hover:bg-muted rounded-md transition-colors",
                  isActive && "bg-muted font-medium text-travel-gold"
                )}
                onClick={() => setOpen(false)}
              >
                {link.icon}
                {link.title}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto pt-6 border-t">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{user.email}</p>
                  {isAdmin && (
                    <span className="text-xs text-travel-gold">Admin</span>
                  )}
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2"
                onClick={() => {
                  signOut();
                  setOpen(false);
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button 
              asChild 
              className="w-full bg-travel-gold hover:bg-amber-600 text-black"
              onClick={() => setOpen(false)}
            >
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
