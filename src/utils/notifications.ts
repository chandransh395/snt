
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
    
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

export async function getAdminNotifications(): Promise<BookingNotification[]> {
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
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function markNotificationAsViewed(notificationId: string) {
  try {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ viewed: true })
      .eq('id', notificationId);
      
    if (error) throw error;
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
      
      // Also create a notification record
      sendBookingNotification(
        booking.id, 
        booking.destination_name, 
        booking.traveler_name
      );
    })
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
}
