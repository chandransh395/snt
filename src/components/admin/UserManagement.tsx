
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
import { Shield, ShieldCheck, ShieldAlert, UserRound, AlertCircle, Loader2, UserX, UserPlus } from 'lucide-react';

type UserWithRole = {
  id: string;
  email: string;
  created_at: string;
  username: string;
  is_admin: boolean;
  is_super_admin: boolean;
  last_sign_in_at: string | null;
};

// Function to safely get properties from potentially problematic data
const safeGet = <T, K extends keyof T>(obj: T | null, key: K, defaultValue: any): any => {
  if (!obj) return defaultValue;
  return (obj as any)[key] !== undefined ? (obj as any)[key] : defaultValue;
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
  const [openMakeSuperAdminDialog, setOpenMakeSuperAdminDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [transferConfirm, setTransferConfirm] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Fetch users and check if current user is super admin
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        
        // First check if current user is super admin
        if (user) {
          const { data: superAdminData, error: superAdminError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (!superAdminError && superAdminData) {
            setIsSuperAdmin(!!superAdminData.is_super_admin);
          }
        }
        
        // Get all profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, created_at');
          
        if (profileError) {
          throw profileError;
        }
        
        if (!profileData || profileData.length === 0) {
          setUsers([]);
          throw new Error("No user profiles found");
        }
        
        // Get all roles
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*');
          
        if (roleError) {
          throw roleError;
        }
        
        // Create user records by combining profile, role and available info
        const combinedUsers = profileData.map(profile => {
          const roleInfo = roleData?.find(r => r.user_id === profile.id);
          
          // Basic user info from profile
          return {
            id: profile.id,
            email: profile.username || 'Unknown Email', // Use username as email fallback
            created_at: profile.created_at,
            username: profile.username || 'Unknown',
            is_admin: roleInfo ? !!roleInfo.is_admin : false,
            is_super_admin: roleInfo ? !!roleInfo.is_super_admin : false,
            last_sign_in_at: null
          };
        });
        
        setUsers(combinedUsers);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        setFetchError(error.message || 'Failed to load users');
        toast({
          title: 'Error',
          description: 'Failed to load users: ' + (error.message || 'Unknown error'),
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
      
      // Regular admins can't revoke admin privileges from other admins
      if (!isSuperAdmin && isCurrentlyAdmin) {
        toast({
          title: 'Permission Denied',
          description: 'Only super admins can revoke admin privileges.',
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
      
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update user role: ' + (error.message || 'Unknown error'),
        variant: 'destructive',
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  // Toggle super admin status (for existing admins)
  const toggleSuperAdminRole = async (userId: string, isCurrentlySuperAdmin: boolean) => {
    try {
      setUpdatingUser(userId);
      
      if (!isSuperAdmin) {
        toast({
          title: 'Permission Denied',
          description: 'Only super admins can modify super admin accounts.',
          variant: 'destructive',
        });
        return;
      }
      
      const { error } = await supabase
        .from('user_roles')
        .update({ 
          is_super_admin: !isCurrentlySuperAdmin,
          // If making super admin, ensure they are also admin
          is_admin: !isCurrentlySuperAdmin ? true : undefined
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { 
          ...u, 
          is_super_admin: !isCurrentlySuperAdmin,
          is_admin: !isCurrentlySuperAdmin ? true : u.is_admin
        } : u
      ));
      
      toast({
        title: 'Super Admin Role Updated',
        description: `User is now ${!isCurrentlySuperAdmin ? 'a super admin' : 'a regular admin'}.`,
      });
      
    } catch (error: any) {
      console.error('Error updating super admin role:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update super admin role: ' + (error.message || 'Unknown error'),
        variant: 'destructive',
      });
    } finally {
      setUpdatingUser(null);
      setOpenMakeSuperAdminDialog(false);
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
      
    } catch (error: any) {
      console.error('Error transferring super admin role:', error);
      toast({
        title: 'Transfer Failed',
        description: 'Failed to transfer super admin role: ' + (error.message || 'Unknown error'),
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
  
  const isSuperAdminEmail = (email: string) => {
    return email.toLowerCase() === 'chandranshbinjola@gmail.com';
  };

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
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <div>
                <p className="text-xl font-semibold">Error Loading Users</p>
                <p className="text-muted-foreground">{fetchError}</p>
              </div>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Email Address</TableHead>
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
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.is_super_admin ? (
                            <Badge className="bg-purple-600 flex items-center gap-1">
                              <ShieldAlert className="h-3 w-3" />
                              Super Admin
                            </Badge>
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
                          <span className="text-muted-foreground">{user.email}</span>
                          {isSuperAdminEmail(user.email) && (
                            <Badge variant="outline" className="ml-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700">
                              Designated Super Admin
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {/* Super Admin Management (only for super admins) */}
                            {isSuperAdmin && user.id !== user?.id && !isSuperAdminEmail(user.email) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={updatingUser === user.id}
                                    title={user.is_super_admin ? "Remove Super Admin Status" : "Make Super Admin"}
                                  >
                                    {updatingUser === user.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : user.is_super_admin ? (
                                      <ShieldAlert className="h-4 w-4 text-purple-500" />
                                    ) : (
                                      <ShieldCheck className="h-4 w-4 text-gray-400" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {user.is_super_admin ? 'Remove Super Admin Status?' : 'Make User a Super Admin?'}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {user.is_super_admin 
                                        ? 'This will remove super admin privileges from this user.'
                                        : 'This will grant super admin privileges to this user, allowing them to manage all aspects of the site, including other admins.'
                                      }
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => toggleSuperAdminRole(user.id, user.is_super_admin)}>
                                      {user.is_super_admin ? 'Remove Super Admin' : 'Make Super Admin'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            
                            {/* Regular Admin Toggle */}
                            {(isSuperAdmin || (!user.is_admin && !user.is_super_admin)) && 
                              (user.id !== user?.id || !user.is_super_admin) && !isSuperAdminEmail(user.email) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={updatingUser === user.id || (!isSuperAdmin && user.is_admin) || (user.is_super_admin && !isSuperAdmin)}
                                    title={user.is_admin ? "Revoke Admin Rights" : "Grant Admin Rights"}
                                  >
                                    {updatingUser === user.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : user.is_admin ? (
                                      <UserX className="h-4 w-4 text-red-500" />
                                    ) : (
                                      <UserRound className="h-4 w-4" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {user.is_admin ? 'Revoke Admin Rights?' : 'Grant Admin Rights?'}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {user.is_admin 
                                        ? 'This will remove admin privileges from this user. Only super admins can revoke admin privileges.'
                                        : 'This will grant admin privileges to this user, allowing them to access the admin panel and manage content.'
                                      }
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => toggleAdminRole(user.id, user.is_admin)}>
                                      {user.is_admin ? 'Revoke Admin Rights' : 'Grant Admin Rights'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
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
                : 'Only super admins can modify admin accounts or revoke admin rights'}
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserManagement;
