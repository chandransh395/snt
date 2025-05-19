
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/ui/icons';
import { Shield, ShieldCheck, User, AlertCircle, Loader2 } from 'lucide-react';

type UserWithRole = {
  id: string;
  email: string;
  created_at: string;
  username: string;
  is_admin: boolean;
  is_super_admin: boolean;
  last_sign_in_at: string | null;
};

const UserManagement = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [transferConfirm, setTransferConfirm] = useState('');
  
  // Fetch users and check if current user is super admin
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // First check if current user is super admin
        if (user) {
          const { data: superAdminData, error: superAdminError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (!superAdminError && superAdminData) {
            // Check if is_super_admin exists in the returned data
            setIsSuperAdmin(!!superAdminData.is_super_admin);
          }
        }
        
        // Fetch all users with their roles
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, username, created_at');
          
        if (userError || !userData) throw userError;
        
        // Fetch role data - we need to handle the case where is_super_admin might not exist
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*');
          
        if (roleError || !roleData) throw roleError;
        
        // Fetch auth users for emails - this now returns proper data
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) throw authError;
        
        // Fix: Extract the users array properly from the returned data
        const authUsers = authData?.users || [];
        
        // Combine the data
        const combinedUsers = userData.map(profile => {
          const role = roleData.find(r => r.user_id === profile.id) || { is_admin: false, is_super_admin: false };
          // Fix: Use find with proper type checking
          const authUser = authUsers.find((au: any) => au.id === profile.id);
          
          return {
            id: profile.id,
            email: authUser?.email || 'Unknown',
            created_at: profile.created_at,
            username: profile.username || authUser?.email || 'Unknown',
            is_admin: !!role.is_admin,
            is_super_admin: !!role.is_super_admin,
            last_sign_in_at: authUser?.last_sign_in_at || null
          };
        });
        
        setUsers(combinedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin, toast]);
  
  // Update user role
  const toggleAdminRole = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      setUpdatingUser(userId);
      
      // Don't allow non-super admins to remove super admin status
      if (!isSuperAdmin && users.find(u => u.id === userId)?.is_super_admin) {
        toast({
          title: 'Permission Denied',
          description: 'Only super admins can modify super admin accounts.',
          variant: 'destructive',
        });
        return;
      }
      
      const { error } = await supabase
        .from('user_roles')
        .update({ is_admin: !isCurrentlyAdmin })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_admin: !isCurrentlyAdmin } : u
      ));
      
      toast({
        title: 'Role Updated',
        description: `User is now ${!isCurrentlyAdmin ? 'an admin' : 'a regular user'}.`,
      });
      
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update user role.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingUser(null);
    }
  };
  
  // Transfer super admin status
  const transferSuperAdminRole = async () => {
    if (!selectedUserId || transferConfirm !== 'TRANSFER') return;
    
    try {
      setUpdatingUser(selectedUserId);
      
      // First, make the target user a super admin
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ 
          is_admin: true,
          is_super_admin: true 
        })
        .eq('user_id', selectedUserId);
      
      if (updateError) throw updateError;
      
      // Then, remove super admin status from current user
      if (user) {
        const { error: removeError } = await supabase
          .from('user_roles')
          .update({ is_super_admin: false })
          .eq('user_id', user.id);
        
        if (removeError) throw removeError;
      }
      
      // Update local state
      setUsers(users.map(u => {
        if (u.id === selectedUserId) {
          return { ...u, is_admin: true, is_super_admin: true };
        }
        if (user && u.id === user.id) {
          return { ...u, is_super_admin: false };
        }
        return u;
      }));
      
      setIsSuperAdmin(false);
      setOpenTransferDialog(false);
      setTransferConfirm('');
      
      toast({
        title: 'Super Admin Transferred',
        description: 'The super admin role has been transferred successfully.',
      });
      
    } catch (error) {
      console.error('Error transferring super admin role:', error);
      toast({
        title: 'Transfer Failed',
        description: 'Failed to transfer super admin role.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  const filteredUsers = users.filter(user => 
    !searchEmail || user.email.toLowerCase().includes(searchEmail.toLowerCase())
  );
  
  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You don't have permission to manage users.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <CardTitle className="text-2xl">User Management</CardTitle>
            <CardDescription>Manage user roles and permissions</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="max-w-xs"
            />
            
            {isSuperAdmin && (
              <Dialog open={openTransferDialog} onOpenChange={setOpenTransferDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="hidden md:inline">Transfer Super Admin</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Transfer Super Admin Status</DialogTitle>
                    <DialogDescription>
                      This will transfer your super admin privileges to another user. You will lose the ability to manage other admins.
                      This action is irreversible.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="user-select" className="text-sm font-medium">
                        Select User
                      </label>
                      <select 
                        id="user-select"
                        className="w-full p-2 border rounded-md"
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        value={selectedUserId || ''}
                      >
                        <option value="">Select a user</option>
                        {users.filter(u => u.id !== user?.id).map(u => (
                          <option key={u.id} value={u.id}>
                            {u.email} {u.is_admin ? '(Admin)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="confirm-transfer" className="text-sm font-medium">
                        Type TRANSFER to confirm
                      </label>
                      <Input
                        id="confirm-transfer"
                        value={transferConfirm}
                        onChange={(e) => setTransferConfirm(e.target.value)}
                        placeholder="TRANSFER"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenTransferDialog(false)}>Cancel</Button>
                    <Button 
                      variant="default" 
                      onClick={transferSuperAdminRole} 
                      disabled={!selectedUserId || transferConfirm !== 'TRANSFER'}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Transfer Super Admin Role
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-travel-gold" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {searchEmail ? 'No users match your search' : 'No users found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.username || user.email}</span>
                            {user.username !== user.email && <span className="text-sm text-muted-foreground">{user.email}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.is_super_admin ? (
                            <Badge className="bg-purple-600">Super Admin</Badge>
                          ) : user.is_admin ? (
                            <Badge>Admin</Badge>
                          ) : (
                            <Badge variant="outline">User</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.is_super_admin ? (
                            <Button variant="ghost" disabled className="h-8 w-8 p-0">
                              <ShieldCheck className="h-4 w-4" />
                            </Button>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  disabled={updatingUser === user.id || (!isSuperAdmin && user.is_admin) || user.id === user?.id}
                                >
                                  {updatingUser === user.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : user.is_admin ? (
                                    <Shield className="h-4 w-4 text-amber-500" />
                                  ) : (
                                    <User className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {user.is_admin ? 'Remove Admin Rights?' : 'Make User an Admin?'}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {user.is_admin 
                                      ? 'This will remove admin privileges from this user.'
                                      : 'This will grant admin privileges to this user, allowing them to access the admin panel and manage content.'
                                    }
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => toggleAdminRole(user.id, user.is_admin)}>
                                    {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between flex-col sm:flex-row gap-4 border-t pt-6">
          <div className="text-sm text-muted-foreground">
            {filteredUsers.length} user{filteredUsers.length === 1 ? '' : 's'} total
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            <p>
              {isSuperAdmin 
                ? 'You are a super admin and can manage all users' 
                : 'Only super admins can modify other admin accounts'}
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserManagement;
