
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  BookOpen,
  Users,
  Settings,
  Inbox,
  CalendarIcon,
  BriefcaseIcon,
  GaugeCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  count?: number;
}

const SidebarLink = ({ href, icon, text, count }: SidebarLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === href || location.pathname.startsWith(`${href}/`);
  
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center justify-between px-4 py-3 transition-colors rounded-md",
        isActive
          ? "bg-travel-gold/10 text-travel-gold"
          : "hover:bg-muted"
      )}
    >
      <div className="flex items-center">
        <div className="mr-3">{icon}</div>
        <span>{text}</span>
      </div>
      {count !== undefined && (
        <div className={cn(
          "rounded-full text-xs font-medium py-0.5 px-2",
          isActive 
            ? "bg-travel-gold text-black" 
            : "bg-muted-foreground/20 text-muted-foreground"
        )}>
          {count}
        </div>
      )}
    </Link>
  );
};

const AdminSidebar = () => {
  return (
    <aside className="h-full w-64 p-4 border-r overflow-auto space-y-6 bg-background">
      <div className="text-center md:hidden py-4 border-b mb-4">
        <h3 className="font-bold text-lg">Admin Panel</h3>
      </div>
      
      <div className="py-2">
        <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2">
          Dashboard
        </h3>
        <SidebarLink
          href="/admin"
          icon={<LayoutDashboard className="h-5 w-5" />}
          text="Overview"
        />
      </div>
      
      <div className="py-2 border-t">
        <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2 mt-2">
          Content
        </h3>
        <div className="space-y-1">
          <SidebarLink
            href="/admin/destinations"
            icon={<MapPin className="h-5 w-5" />}
            text="Destinations"
          />
          <SidebarLink
            href="/admin/blog"
            icon={<BookOpen className="h-5 w-5" />}
            text="Blog"
          />
        </div>
      </div>
      
      <div className="py-2 border-t">
        <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2 mt-2">
          Business
        </h3>
        <div className="space-y-1">
          <SidebarLink
            href="/admin/bookings"
            icon={<CalendarIcon className="h-5 w-5" />}
            text="Bookings"
          />
          <SidebarLink
            href="/admin/contact-messages"
            icon={<Inbox className="h-5 w-5" />}
            text="Contact Messages"
            count={3}
          />
        </div>
      </div>
      
      <div className="py-2 border-t">
        <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2 mt-2">
          Administration
        </h3>
        <div className="space-y-1">
          <SidebarLink
            href="/admin/users"
            icon={<Users className="h-5 w-5" />}
            text="User Management"
          />
          <SidebarLink
            href="/admin/settings"
            icon={<Settings className="h-5 w-5" />}
            text="Site Settings"
          />
        </div>
      </div>
      
      <div className="py-2 border-t mt-auto">
        <div className="px-4 py-2">
          <div className="text-xs text-muted-foreground">System Status</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-green-500 h-2 w-2 rounded-full"></span>
            <span className="text-sm">All systems operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
