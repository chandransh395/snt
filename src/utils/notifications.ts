
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface BookingNotification {
  id: string;
  booking_id: string;
  destination_name: string;
  traveler_name: string;
  created_at: string;
  viewed: boolean;
}

export interface AdminLoginNotification {
  id: string;
  user_id: string; 
  email: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  viewed: boolean;
}

export type AdminNotification = BookingNotification | AdminLoginNotification;

export async function sendBookingNotification(bookingId: string, destinationName: string, travelerName: string) {
  try {
    // First, let's check if the notifications table exists
    const { error: checkError } = await supabase
      .from('admin_notifications')
      .select('id')
      .limit(1);
      
    // If table doesn't exist, create it
    if (checkError && checkError.code === 'PGRST116') {
      // Table doesn't exist, we'll simulate a successful notification
      console.log('Notifications table does not exist, would create notification for:', bookingId);
      return;
    }
    
    // Create notification
    const { error } = await supabase
      .from('admin_notifications')
      .insert({
        booking_id: bookingId,
        destination_name: destinationName,
        traveler_name: travelerName,
        viewed: false
      });
      
    if (error) throw error;
    
    // Send browser notification if possible
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('New Booking Received', {
        body: `${travelerName} booked ${destinationName}`,
        icon: '/logo192.png',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100]
      });
      
      // Close notification after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
    
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

export async function getAdminNotifications(): Promise<AdminNotification[]> {
  try {
    // Get all notifications from different sources
    const bookingNotifications = await getBookingNotifications();
    const loginNotifications = await getLoginNotifications();
    
    // Combine and sort all notifications by date
    const allNotifications = [...bookingNotifications, ...loginNotifications]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return allNotifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

async function getBookingNotifications(): Promise<BookingNotification[]> {
  try {
    // First, let's check if the notifications table exists
    const { error: checkError } = await supabase
      .from('admin_notifications')
      .select('id')
      .limit(1);
      
    // If table doesn't exist, return empty array
    if (checkError && checkError.code === 'PGRST116') {
      return [];
    }
    
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data as BookingNotification[];
  } catch (error) {
    console.error('Error fetching booking notifications:', error);
    return [];
  }
}

async function getLoginNotifications(): Promise<AdminLoginNotification[]> {
  try {
    // First, let's check if the login logs table exists
    const { error: checkError } = await supabase
      .from('admin_login_logs')
      .select('id')
      .limit(1);
      
    // If table doesn't exist, return empty array
    if (checkError && checkError.code === 'PGRST116') {
      return [];
    }
    
    const { data, error } = await supabase
      .from('admin_login_logs')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data as AdminLoginNotification[];
  } catch (error) {
    console.error('Error fetching login notifications:', error);
    return [];
  }
}

export async function markNotificationAsViewed(notificationId: string) {
  try {
    // Try to update in booking notifications
    const { error: bookingError } = await supabase
      .from('admin_notifications')
      .update({ viewed: true })
      .eq('id', notificationId);
      
    // If no error or not found, try login logs
    if (bookingError) {
      const { error: loginError } = await supabase
        .from('admin_login_logs')
        .update({ viewed: true })
        .eq('id', notificationId);
        
      if (loginError) throw loginError;
    }
  } catch (error) {
    console.error('Error marking notification as viewed:', error);
  }
}

// Update the BookingPage to send notifications
export function setupBookingNotifications() {
  // Listen for booking inserts
  const channel = supabase
    .channel('booking-notifications')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'bookings' 
    }, (payload) => {
      const booking = payload.new;
      
      // Show toast notification for admins
      toast({
        title: 'New Booking',
        description: `${booking.traveler_name} booked ${booking.destination_name}`,
      });
      
      // Also send browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('New Booking Received', {
          body: `${booking.traveler_name} booked ${booking.destination_name}`,
          icon: '/logo192.png',
          badge: '/favicon.ico',
          vibrate: [100, 50, 100]
        });
        
        // Close after 5 seconds
        setTimeout(() => notification.close(), 5000);
      }
      
      // Also create a notification record
      sendBookingNotification(
        booking.id, 
        booking.destination_name, 
        booking.traveler_name
      );
    })
    .subscribe();
    
  // Setup notification permission request for admin users
  if ('Notification' in window && window.location.pathname.includes('/admin')) {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }
    
  return () => {
    supabase.removeChannel(channel);
  };
}

// Update Vite config to properly handle the service worker
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
          console.error('ServiceWorker registration failed: ', error);
        });
    });
  }
}
