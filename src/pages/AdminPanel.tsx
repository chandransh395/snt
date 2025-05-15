
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';

type UserWithRole = {
  id: string;
  email: string;
  is_admin: boolean;
  username: string | null;
};

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  
  // Redirect if not logged in or not an admin
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users from auth schema (using a specialized query)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;
      
      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, is_admin');
        
      if (rolesError) throw rolesError;
      
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username');
        
      if (profilesError) throw profilesError;
      
      // Combine data
      const combinedUsers = authUsers.users.map(authUser => {
        const userRole = userRoles.find(role => role.user_id === authUser.id);
        const profile = profiles.find(profile => profile.id === authUser.id);
        
        return {
          id: authUser.id,
          email: authUser.email || '',
          is_admin: userRole?.is_admin || false,
          username: profile?.username || null
        };
      });
      
      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const toggleAdminRole = async (userId: string, currentStatus: boolean) => {
    try {
      // Prevent removing admin role from yourself
      if (userId === user?.id && currentStatus) {
        toast({
          title: 'Action denied',
          description: 'You cannot remove your own admin privileges.',
          variant: 'destructive',
        });
        return;
      }
      
      const { error } = await supabase
        .from('user_roles')
        .update({ is_admin: !currentStatus })
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_admin: !currentStatus } : u
      ));
      
      toast({
        title: 'Success',
        description: `Admin status ${!currentStatus ? 'granted' : 'revoked'} successfully.`,
      });
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update admin status.',
        variant: 'destructive',
      });
    }
  };
  
  const filteredUsers = users.filter(user => 
    searchEmail === '' || user.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="search">Search by Email</Label>
            <Input
              id="search"
              placeholder="Search users..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="max-w-md mt-1"
            />
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead className="w-[100px]">Admin</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No users found</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.username || 'N/A'}</TableCell>
                      <TableCell>
                        <Switch
                          checked={user.is_admin}
                          onCheckedChange={() => toggleAdminRole(user.id, user.is_admin)}
                          disabled={user.id === user?.id} // Disable for current user
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {user.id === user?.id && (
                          <span className="text-xs text-muted-foreground">Current User</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Button onClick={fetchUsers} disabled={loading}>
        Refresh Users
      </Button>
    </div>
  );
};

export default AdminPanel;
