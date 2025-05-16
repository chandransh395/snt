
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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
  const [analyticsData, setAnalyticsData] = useState({
    destinations: [],
    users: { total: 0, admins: 0, regular: 0 },
    bookings: []
  });
  
  // Redirect if not logged in or not an admin
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  useEffect(() => {
    fetchUsers();
    fetchAnalyticsData();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, is_admin');
        
      if (rolesError) throw rolesError;
      
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username');
        
      if (profilesError) throw profilesErrors;
      
      // Fetch users from auth.users using the admin API
      const { data: authUsersData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        throw authError;
      }
      
      if (!authUsersData || !authUsersData.users) {
        throw new Error("No users data returned");
      }
      
      // Combine data
      const combinedUsers = authUsersData.users.map(authUser => {
        const userRole = userRoles?.find(role => role.user_id === authUser.id);
        const profile = profiles?.find(profile => profile.id === authUser.id);
        
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
        description: 'Failed to fetch users. Make sure you have the correct admin privileges.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      // Get total users count
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (usersError) throw usersError;
      
      // Get admin users count
      const { count: adminsCount, error: adminsError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('is_admin', true);
        
      if (adminsError) throw adminsError;
      
      // Get destinations data for analytics
      const { data: destinations, error: destinationsError } = await supabase
        .from('destinations')
        .select('region')
        .order('region');
        
      if (!destinationsError && destinations) {
        // Process destinations for chart
        const regions = destinations.map(d => d.region);
        const regionCounts = regions.reduce((acc, region) => {
          acc[region] = (acc[region] || 0) + 1;
          return acc;
        }, {});
        
        const regionData = Object.keys(regionCounts).map(region => ({
          name: region.charAt(0).toUpperCase() + region.slice(1),
          count: regionCounts[region]
        }));
        
        // Get bookings data
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('status')
          .order('status');
          
        if (!bookingsError && bookings) {
          // Process bookings for chart
          const statuses = bookings.map(b => b.status);
          const statusCounts = statuses.reduce((acc, status) => {
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {});
          
          const bookingsData = Object.keys(statusCounts).map(status => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            count: statusCounts[status]
          }));
          
          setAnalyticsData({
            destinations: regionData,
            users: {
              total: usersCount || 0,
              admins: adminsCount || 0,
              regular: (usersCount || 0) - (adminsCount || 0)
            },
            bookings: bookingsData
          });
        }
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
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

  // Custom colors for charts
  const COLORS = ['#d4af37', '#956f25', '#705219', '#cccccc', '#8c8262'];

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      <Tabs defaultValue="users" className="mb-8">
        <TabsList className="mb-8">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="content">Content Management</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
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
              
              <Button onClick={fetchUsers} disabled={loading} className="mt-6">
                Refresh Users
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Admin Users", value: analyticsData.users.admins },
                        { name: "Regular Users", value: analyticsData.users.regular }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {[0, 1].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <p>Total Users: {analyticsData.users.total}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Destinations by Region</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.destinations}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Destinations" fill="#d4af37" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Bookings by Status</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.bookings}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Bookings" fill="#956f25" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="content">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link to="/admin/destinations">
                    <Button variant="outline" className="w-full h-24 text-lg font-medium">
                      Manage Destinations
                    </Button>
                  </Link>
                  <Link to="/admin/blog">
                    <Button variant="outline" className="w-full h-24 text-lg font-medium">
                      Manage Blog Posts
                    </Button>
                  </Link>
                  <Link to="/admin/settings">
                    <Button variant="outline" className="w-full h-24 text-lg font-medium">
                      Site Settings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Booking Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Link to="/admin/bookings">
                <Button className="bg-travel-gold hover:bg-amber-600 text-black">
                  Go to Booking Management
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
