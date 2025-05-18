
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Loader2, TrendingUp, TrendingDown, Users, MapPin, 
  CalendarRange, DollarSign, Briefcase
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDestinations: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalUsers: 0,
    revenue: 0,
  });
  
  const [recentBookings, setRecentBookings] = useState([]);
  const [bookingTrends, setBookingTrends] = useState([]);
  const [regionDistribution, setRegionDistribution] = useState([]);
  
  // Redirect if not logged in or not an admin
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all required data in parallel for better performance
      const [
        destResults, 
        bookingResults, 
        pendingResults, 
        userResults,
        recentBookingResults,
        regionResults
      ] = await Promise.all([
        // Destinations count
        supabase.from('destinations').select('*', { count: 'exact', head: true }),
        
        // Total bookings
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        
        // Pending bookings
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        
        // User count
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        
        // Recent bookings
        supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(5),
        
        // Region distribution
        supabase.from('destinations').select('region')
      ]);
      
      // Calculate total revenue (assuming bookings have a price field)
      const { data: bookingsData } = await supabase.from('bookings').select('price');
      const totalRevenue = bookingsData?.reduce((sum, booking) => sum + Number(booking.price), 0) || 0;
      
      // Process region distribution
      const regions = regionResults.data?.reduce((acc, dest) => {
        acc[dest.region] = (acc[dest.region] || 0) + 1;
        return acc;
      }, {});
      
      const regionData = Object.entries(regions || {}).map(([name, value]) => ({ name, value }));
      
      // Mock booking trends (in a real app, would be from database)
      const mockTrends = [
        { month: 'Jan', bookings: 12 },
        { month: 'Feb', bookings: 19 },
        { month: 'Mar', bookings: 15 },
        { month: 'Apr', bookings: 24 },
        { month: 'May', bookings: 30 },
        { month: 'Jun', bookings: 35 },
      ];
      
      setStats({
        totalDestinations: destResults.count || 0,
        totalBookings: bookingResults.count || 0,
        pendingBookings: pendingResults.count || 0,
        totalUsers: userResults.count || 0,
        revenue: totalRevenue,
      });
      
      setRecentBookings(recentBookingResults.data || []);
      setBookingTrends(mockTrends);
      setRegionDistribution(regionData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Colors for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-travel-gold" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Destinations</p>
                    <h3 className="text-2xl font-bold">{stats.totalDestinations}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-amber-100 p-3 rounded-full mr-4">
                    <Briefcase className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <h3 className="text-2xl font-bold">{stats.totalBookings}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <CalendarRange className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Bookings</p>
                    <h3 className="text-2xl font-bold">{stats.pendingBookings}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-red-100 p-3 rounded-full mr-4">
                    <DollarSign className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <h3 className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Bookings Trend</CardTitle>
                <CardDescription>Monthly booking volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartContainer config={{
                    bookings: { theme: { light: '#8884d8', dark: '#8884d8' } }
                  }}>
                    <BarChart data={bookingTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="bookings" fill="var(--color-bookings, #8884d8)" name="Bookings" />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Destinations by Region</CardTitle>
                <CardDescription>Distribution of destination offerings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={regionDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {regionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Bookings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest booking activity on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Traveler</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No recent bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentBookings.map((booking, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{booking.traveler_name}</TableCell>
                        <TableCell>{booking.destination_name}</TableCell>
                        <TableCell>{new Date(booking.travel_date).toLocaleDateString()}</TableCell>
                        <TableCell>₹{Number(booking.price).toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <Button onClick={() => window.location.href = '/admin/settings'}>
              Manage Site Settings
            </Button>
            <Button className="bg-travel-gold hover:bg-amber-600 text-black" onClick={() => window.location.href = '/admin/destinations'}>
              Manage Destinations
            </Button>
            <Button onClick={() => window.location.href = '/admin/bookings'}>
              Manage Bookings
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
