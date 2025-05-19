
import { supabase } from '@/integrations/supabase/client';

/**
 * Sets up the super admin user
 * This should be called on app initialization
 */
export async function setupSuperAdmin() {
  try {
    // First check if the email exists in auth
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return;
    }
    
    const users = userData.users;
    const superAdminEmail = 'chandranshbinjola@gmail.com';
    const superAdminUser = users.find((user: any) => user.email === superAdminEmail);
    
    if (!superAdminUser) {
      console.log('Super admin user not found in auth');
      return;
    }
    
    // Check if this user already has a role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', superAdminUser.id)
      .single();
      
    if (roleError && roleError.code !== 'PGRST116') {
      console.error('Error checking super admin role:', roleError);
    }
    
    if (roleData) {
      // Update the existing role to super admin
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({
          is_admin: true,
          is_super_admin: true
        })
        .eq('user_id', superAdminUser.id);
        
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
          user_id: superAdminUser.id,
          is_admin: true,
          is_super_admin: true,
        });
        
      if (insertError) {
        console.error('Error creating super admin role:', insertError);
      } else {
        console.log('Created super admin role for:', superAdminEmail);
      }
    }
    
    // Ensure user has a profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', superAdminUser.id)
      .single();
      
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking profile:', profileError);
    }
    
    if (!profileData) {
      // Create profile for the user
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: superAdminUser.id,
          username: superAdminEmail.split('@')[0],
          created_at: new Date().toISOString()
        });
        
      if (createProfileError) {
        console.error('Error creating profile:', createProfileError);
      }
    }
    
  } catch (error) {
    console.error('Error in setupSuperAdmin:', error);
  }
}
