
import * as React from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, X, User, LogOut, Home, Info, Map, BookOpen, 
  MessageSquare, ShieldCheck, Bookmark
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type NavItem = {
  title: string;
  href: string;
  isAdmin?: boolean;
  icon?: React.ReactNode;
};

interface MobileNavProps {
  navLinks: NavItem[];
}

const MobileNav = ({ navLinks }: MobileNavProps) => {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  
  // Remove duplicate "My Trips" entries and add only one if user is logged in
  const uniqueNavLinks = [...navLinks];
  if (user) {
    // Remove any existing "My Trips" entries
    const filteredLinks = uniqueNavLinks.filter(link => link.title !== "My Trips");
    // Add single "My Trips" entry before admin links
    const adminIndex = filteredLinks.findIndex(link => link.isAdmin);
    const insertIndex = adminIndex !== -1 ? adminIndex : filteredLinks.length;
    filteredLinks.splice(insertIndex, 0, {
      title: "My Trips",
      href: "/my-trips",
      icon: <Bookmark className="h-5 w-5 mr-3" />
    });
    uniqueNavLinks.splice(0, uniqueNavLinks.length, ...filteredLinks);
  }
  
  // Map icons to navigation links
  const navLinksWithIcons = uniqueNavLinks.map(link => {
    if (link.icon) return link;
    
    let icon;
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
      case '/admin/contact-messages':
        icon = <ShieldCheck className="h-5 w-5 mr-3" />;
        break;
      default:
        icon = null;
    }
    
    return { ...link, icon };
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-[280px] sm:w-[320px] flex flex-col bg-gradient-to-b from-background to-background/95 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between border-b pb-4">
          <div className="font-bold text-lg text-gradient">Navigation</div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <nav className="flex flex-col gap-2 mt-6 flex-1">
          {navLinksWithIcons.map((link) => {
            // Skip admin links for non-admin users
            if (link.isAdmin && !isAdmin) return null;
            
            const isActive = location.pathname === link.href;
            
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center py-3 px-4 text-lg hover:bg-muted rounded-md transition-colors hover-lift",
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
                <Avatar className="h-10 w-10 mr-3 bg-travel-gold/20 border border-travel-gold/30 flex-shrink-0">
                  <AvatarFallback className="bg-travel-gold/20 text-travel-gold text-sm">
                    {user.email?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate" title={user.email}>
                    {user.email}
                  </p>
                  {isAdmin && (
                    <span className="text-xs text-travel-gold">Admin</span>
                  )}
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2 hover-scale"
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
              className="w-full bg-travel-gold hover:bg-amber-600 text-black hover-scale"
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
