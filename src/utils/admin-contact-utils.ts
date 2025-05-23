
import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures that the contact_messages and contact_replies tables are created
 */
export async function ensureContactTablesExist() {
  try {
    // Check if contact_messages table exists
    const { data: messagesExist, error: messagesError } = await supabase
      .from('contact_messages')
      .select('id')
      .limit(1);
      
    if (messagesError && messagesError.code === '42P01') {
      // Table doesn't exist, create it
      const { error: createError } = await supabase.rpc('create_contact_tables');
      
      if (createError) {
        console.error('Error creating contact tables:', createError);
      } else {
        console.log('Contact tables created successfully');
      }
    }
  } catch (error) {
    console.error('Error checking/creating contact tables:', error);
  }
}

/**
 * Get contact message statistics
 */
export async function getContactStats() {
  try {
    // Get total messages
    const { data: totalMessages, error: totalError } = await supabase
      .from('contact_messages')
      .select('id', { count: 'exact' });
      
    // Get unread messages
    const { data: unreadMessages, error: unreadError } = await supabase
      .from('contact_messages')
      .select('id', { count: 'exact' })
      .eq('status', 'new');
      
    // Get replied messages
    const { data: repliedMessages, error: repliedError } = await supabase
      .from('contact_messages')
      .select('id', { count: 'exact' })
      .eq('status', 'replied');
      
    // Get recent messages (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: recentMessages, error: recentError } = await supabase
      .from('contact_messages')
      .select('id', { count: 'exact' })
      .gte('created_at', sevenDaysAgo.toISOString());
      
    if (totalError || unreadError || repliedError || recentError) {
      throw new Error('Error fetching contact statistics');
    }
    
    return {
      total: totalMessages?.length || 0,
      unread: unreadMessages?.length || 0,
      replied: repliedMessages?.length || 0,
      recent: recentMessages?.length || 0,
    };
  } catch (error) {
    console.error('Error getting contact statistics:', error);
    return {
      total: 0,
      unread: 0,
      replied: 0,
      recent: 0,
    };
  }
}
