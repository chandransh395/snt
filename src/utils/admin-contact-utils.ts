
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
      console.log('Contact tables do not exist, creating...');
      
      // Create contact_messages table
      const { error: createMessagesError } = await supabase.rpc('create_contact_tables');
      
      if (createMessagesError) {
        // If RPC fails, create tables directly
        await createContactTablesDirectly();
      } else {
        console.log('Contact tables created successfully via RPC');
      }
    }
  } catch (error) {
    console.error('Error checking/creating contact tables:', error);
    
    // Fallback: try to create tables directly
    await createContactTablesDirectly();
  }
}

/**
 * Create contact tables directly if RPC method fails
 */
async function createContactTablesDirectly() {
  try {
    // Create contact_messages table
    const { error: messagesError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        phone TEXT,
        status TEXT DEFAULT 'new',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    if (messagesError) {
      console.error('Error creating contact_messages table:', messagesError);
      return;
    }
    
    // Create contact_replies table
    const { error: repliesError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS contact_replies (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        message_id UUID REFERENCES contact_messages(id) ON DELETE CASCADE,
        admin_name TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    if (repliesError) {
      console.error('Error creating contact_replies table:', repliesError);
      return;
    }
    
    console.log('Contact tables created successfully directly');
    
    // Add sample data
    await addSampleContactMessages();
  } catch (error) {
    console.error('Failed to create contact tables directly:', error);
  }
}

/**
 * Add sample contact messages for testing
 */
async function addSampleContactMessages() {
  try {
    const sampleMessages = [
      {
        name: 'John Smith',
        email: 'john@example.com',
        subject: 'Tour Package Inquiry',
        message: 'Hello, I am interested in your European tour packages. Could you please provide more details about the itinerary and pricing for a family of 4? We are planning to travel in August.',
        status: 'new',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        subject: 'Booking Confirmation',
        message: 'I just completed a booking for the Thailand adventure tour but haven\'t received a confirmation email yet. Could you please verify my booking status? My reference number is TH-2023-45678.',
        status: 'replied',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'Michael Brown',
        email: 'michael@example.com',
        phone: '+1 555-123-4567',
        subject: 'Special Requirements',
        message: 'I have a booking for the Japan cultural tour next month. I need to inform you about some dietary restrictions. I am vegetarian and my wife has a gluten allergy. Could you please ensure that appropriate meals are arranged during our tour?',
        status: 'new',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    const { error } = await supabase
      .from('contact_messages')
      .insert(sampleMessages);
      
    if (error) {
      console.error('Error adding sample messages:', error);
    } else {
      console.log('Sample contact messages added successfully');
      
      // Add a sample reply to Sarah's message
      // First get Sarah's message id
      const { data: sarahMessage } = await supabase
        .from('contact_messages')
        .select('id')
        .eq('email', 'sarah@example.com')
        .single();
        
      if (sarahMessage) {
        const { error: replyError } = await supabase
          .from('contact_replies')
          .insert({
            message_id: sarahMessage.id,
            admin_name: 'Admin',
            message: 'Hello Sarah, I have checked your booking and it is confirmed. You should receive the confirmation email shortly. Please let us know if you have any other questions.',
            created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          });
          
        if (replyError) {
          console.error('Error adding sample reply:', replyError);
        } else {
          console.log('Sample reply added successfully');
        }
      }
    }
  } catch (err) {
    console.error('Error adding sample data:', err);
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
