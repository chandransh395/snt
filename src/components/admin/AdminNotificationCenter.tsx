
import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { BookingNotification, getAdminNotifications, markNotificationAsViewed } from '@/utils/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const AdminNotificationCenter = () => {
  const { isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.viewed).length;
  
  // Fetch notifications when component mounts or dropdown opens
  useEffect(() => {
    if (isAdmin && open) {
      fetchNotifications();
    }
  }, [isAdmin, open]);
  
  // Initial load
  useEffect(() => {
    if (isAdmin) {
      fetchNotifications();
      
      // Request notification permission
      if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, [isAdmin]);
  
  const fetchNotifications = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const data = await getAdminNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsViewed(id);
      // Update local state to reflect changes
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, viewed: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  if (!isAdmin) return null;
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchNotifications}
            className="h-8 px-2 text-xs"
          >
            Refresh
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map(notification => (
              <DropdownMenuItem key={notification.id} className={cn(
                "flex flex-col items-start p-3 cursor-default",
                !notification.viewed && "bg-muted/50"
              )}>
                <div className="flex w-full justify-between">
                  <span className="font-medium">New Booking</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-1 text-sm">
                  {notification.traveler_name} booked {notification.destination_name}
                </p>
                {!notification.viewed && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification.id);
                    }}
                    className="mt-2 h-7 text-xs self-end"
                  >
                    <Check className="h-3 w-3 mr-1" /> Mark as read
                  </Button>
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminNotificationCenter;
