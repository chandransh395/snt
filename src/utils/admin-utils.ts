import { supabase } from '@/integrations/supabase/client';
import { format, subDays, parseISO, isValid } from 'date-fns';

/**
 * Sets up the super admin user
 * This should be called on app initialization
 */
export async function setupSuperAdmin() {
  try {
    // Define the designated super admin email
    const superAdminEmail = 'chandranshbinjola@gmail.com';
    
    // Get all users and find our super admin
    const { data: allUsers, error: authError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', superAdminEmail)
      .limit(1)
      .single();
      
    if (authError) {
      console.error('Error checking for super admin:', authError);
      return;
    }
    
    if (!allUsers) {
      console.log('Designated super admin user not found. It will be set up when they first sign up:', superAdminEmail);
      return;
    }
    
    // Check if this user already has a role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', allUsers.id)
      .limit(1)
      .single();
      
    if (roleError && roleError.code !== 'PGRST116') {
      console.error('Error checking super admin role:', roleError);
    }
    
    // Update the is_super_admin field in the user_roles table
    if (roleData) {
      // Update the existing role to super admin
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({
          is_admin: true,
          is_super_admin: true
        })
        .eq('user_id', allUsers.id)
        .limit(1);
        
      if (updateError) {
        console.error('Error updating super admin role:', updateError);
      } else {
        console.log('Updated super admin role for:', superAdminEmail);
      }
    } else {
      // Create a new role for the super admin
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: allUsers.id,
          is_admin: true,
          is_super_admin: true,
        });
        
      if (insertError) {
        console.error('Error creating super admin role:', insertError);
      } else {
        console.log('Created super admin role for:', superAdminEmail);
      }
    }
    
  } catch (error) {
    console.error('Error in setupSuperAdmin:', error);
  }
}

/**
 * Check if a user is a super admin
 * @param userId - The user ID to check
 * @returns Promise that resolves to boolean
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('is_super_admin')
      .eq('user_id', userId)
      .limit(1)
      .single();
      
    if (error) {
      console.error('Error checking super admin status:', error);
      return false;
    }
    
    return data?.is_super_admin === true;
  } catch (error) {
    console.error('Error in isSuperAdmin check:', error);
    return false;
  }
}

/**
 * Get date range for analytics
 * @param timeFrame - The time frame to get data for (7days, 30days, 90days, custom)
 * @param startDate - Optional start date for custom range
 * @param endDate - Optional end date for custom range
 * @returns Array of dates in ISO format
 */
export function getDateRange(timeFrame: '7days' | '30days' | '90days' | 'custom', startDate?: Date, endDate?: Date) {
  const today = new Date();
  let start: Date;
  const end = endDate && isValid(endDate) ? endDate : today;
  
  if (timeFrame === 'custom' && startDate && isValid(startDate)) {
    start = startDate;
  } else {
    const days = timeFrame === '7days' ? 7 : timeFrame === '30days' ? 30 : 90;
    start = subDays(today, days - 1);
  }
  
  // Generate array of all dates in the range
  const dates: string[] = [];
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    dates.push(format(currentDate, 'yyyy-MM-dd'));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * Format booking data for charts
 * @param bookings - Raw booking data from database
 * @param timeFrame - The time frame to format data for
 * @returns Formatted data for charts
 */
export function formatBookingData(bookings: any[], dateRange: string[]) {
  // Initialize data with all dates having 0 bookings
  const formattedData = dateRange.map(date => ({
    name: format(parseISO(date), 'MMM d'),
    fullDate: date,
    bookings: 0,
    revenue: 0
  }));
  
  // Populate with actual booking data
  if (bookings && bookings.length > 0) {
    bookings.forEach(booking => {
      const bookingDate = booking.created_at.split('T')[0];
      const dataPoint = formattedData.find(d => d.fullDate === bookingDate);
      
      if (dataPoint) {
        dataPoint.bookings += 1;
        dataPoint.revenue += Number(booking.price) || 0;
      }
    });
  }
  
  return formattedData;
}

/**
 * Format destination data for charts
 * @param destinations - Raw destination data from database
 * @returns Formatted data for pie chart
 */
export function formatDestinationData(destinations: any[]) {
  if (!destinations || destinations.length === 0) return [];
  
  return destinations
    .filter(d => d.bookings_count > 0)
    .sort((a, b) => b.bookings_count - a.bookings_count)
    .slice(0, 5)  // Take top 5
    .map(dest => ({
      name: dest.name,
      value: dest.bookings_count
    }));
}

/**
 * Calculate booking stats by status
 * @param bookings - Raw booking data
 * @returns Stats object with counts for each status
 */
export function calculateBookingStats(bookings: any[]) {
  if (!bookings || bookings.length === 0) {
    return {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      revenue: 0
    };
  }
  
  return {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    revenue: bookings.reduce((sum, booking) => sum + (Number(booking.price) || 0), 0)
  };
}