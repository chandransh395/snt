
import { Link, useLocation } from 'react-router-dom';
import {
  ChartBarIcon,
  MapPinIcon,
  BookOpenIcon,
  UsersIcon,
  CogIcon,
  InboxIcon,
  CalendarIcon,
} from 'lucide-react';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  text: string;
}

const SidebarLink = ({ href, icon, text }: SidebarLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === href;
  
  return (
    <Link
      to={href}
      className={`flex items-center px-4 py-3 transition-colors rounded-md ${
        isActive
          ? "bg-travel-gold/10 text-travel-gold"
          : "hover:bg-muted"
      }`}
    >
      <div className="mr-3">{icon}</div>
      <span>{text}</span>
    </Link>
  );
};

const AdminSidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 p-4 border-r h-screen overflow-auto sticky top-0 space-y-6">
      <div className="py-2">
        <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2">
          Dashboard
        </h3>
        <SidebarLink
          href="/admin"
          icon={<ChartBarIcon className="h-5 w-5" />}
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
            icon={<MapPinIcon className="h-5 w-5" />}
            text="Destinations"
          />
          <SidebarLink
            href="/admin/blog"
            icon={<BookOpenIcon className="h-5 w-5" />}
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
            icon={<InboxIcon className="h-5 w-5" />}
            text="Contact Messages"
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
            icon={<UsersIcon className="h-5 w-5" />}
            text="User Management"
          />
          <SidebarLink
            href="/admin/settings"
            icon={<CogIcon className="h-5 w-5" />}
            text="Site Settings"
          />
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
