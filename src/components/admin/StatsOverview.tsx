
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart } from '@/components/ui/chart';
import { Loader2, TrendingUp, TrendingDown, Users, MapPin, CreditCard, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/utils/currency';

const StatsOverview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [bookingsStats, setBookingsStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    recentBookings: [],
    revenue: 0
  });
  const [usersStats, setUsersStats] = useState({
    total: 0,
    newThisMonth: 0
  });
  const [destinationsStats, setDestinationsStats] = useState({
    total: 0,
    mostBooked: { name: '', count: 0 }
  });
  const [timeFrame, setTimeFrame] = useState('7days');
  const [bookingTrends, setBookingTrends] = useState<any[]>([]);
  const [topDestinations, setTopDestinations] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  
  useEffect(() => {
    fetchStatistics();
  }, [timeFrame]);
  
  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch bookings statistics
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, destination_name, status, created_at, price, num_travelers');
        
      if (bookingsError) throw bookingsError;
      
      const bookingsByStatus = {
        pending: bookingsData?.filter(b => b.status === 'pending').length || 0,
        confirmed: bookingsData?.filter(b => b.status === 'confirmed').length || 0,
        completed: bookingsData?.filter(b => b.status === 'completed').length || 0,
        cancelled: bookingsData?.filter(b => b.status === 'cancelled').length || 0
      };
      
      const totalRevenue = bookingsData?.reduce((sum, booking) => sum + (booking.price || 0), 0) || 0;
      
      // Fetch users statistics
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;
      
      const users = authData.users || [];
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const newUsers = users.filter((user: any) => {
        return new Date(user.created_at) > firstDayOfMonth;
      });
      
      // Fetch destinations statistics
      const { data: destinationsData, error: destinationsError } = await supabase
        .from('destinations')
        .select('id, name, bookings_count');
        
      if (destinationsError) throw destinationsError;
      
      // Find most booked destination
      let mostBooked = { name: 'None', count: 0 };
      if (destinationsData && destinationsData.length > 0) {
        const sorted = [...destinationsData].sort((a, b) => (b.bookings_count || 0) - (a.bookings_count || 0));
        mostBooked = sorted[0] ? { name: sorted[0].name, count: sorted[0].bookings_count || 0 } : mostBooked;
        
        // Set top destinations for pie chart
        setTopDestinations(sorted.slice(0, 5).map(dest => ({
          name: dest.name,
          value: dest.bookings_count || 0
        })));
      }
      
      // Calculate booking trends based on timeframe
      const days = timeFrame === '7days' ? 7 : timeFrame === '30days' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Group bookings by date
      const dateGroups: {[key: string]: number} = {};
      
      for (let i = 0; i < days; i++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        const dateStr = day.toISOString().split('T')[0];
        dateGroups[dateStr] = 0;
      }
      
      bookingsData?.forEach(booking => {
        const dateStr = new Date(booking.created_at).toISOString().split('T')[0];
        if (dateGroups[dateStr] !== undefined) {
          dateGroups[dateStr]++;
        }
      });
      
      // Format for chart
      const trends = Object.entries(dateGroups).map(([date, count]) => {
        // Format date to more readable format (e.g., May 15)
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return { name: formattedDate, bookings: count };
      });
      
      setBookingTrends(trends);
      
      // Calculate revenue data
      const revenueGroups: {[key: string]: number} = {...dateGroups};
      Object.keys(revenueGroups).forEach(date => {
        revenueGroups[date] = 0;
      });
      
      bookingsData?.forEach(booking => {
        const dateStr = new Date(booking.created_at).toISOString().split('T')[0];
        if (revenueGroups[dateStr] !== undefined) {
          revenueGroups[dateStr] += booking.price || 0;
        }
      });
      
      const revenueChartData = Object.entries(revenueGroups).map(([date, amount]) => {
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return { name: formattedDate, revenue: amount };
      });
      
      setRevenueData(revenueChartData);
      
      // Set all stats
      setBookingsStats({
        total: bookingsData?.length || 0,
        ...bookingsByStatus,
        recentBookings: bookingsData?.slice(0, 5) || [],
        revenue: totalRevenue
      });
      
      setUsersStats({
        total: users.length,
        newThisMonth: newUsers.length
      });
      
      setDestinationsStats({
        total: destinationsData?.length || 0,
        mostBooked
      });
    } catch (error) {
      console.error('Error fetching admin statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-travel-gold" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Time period selector */}
      <div className="flex justify-end">
        <Tabs defaultValue={timeFrame} onValueChange={setTimeFrame}>
          <TabsList>
            <TabsTrigger value="7days">7 Days</TabsTrigger>
            <TabsTrigger value="30days">30 Days</TabsTrigger>
            <TabsTrigger value="90days">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingsStats.total}</div>
            <p className="text-xs text-muted-foreground">
              +{bookingTrends.slice(-7).reduce((sum, day) => sum + day.bookings, 0)} in the last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(bookingsStats.revenue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPrice(revenueData.slice(-7).reduce((sum, day) => sum + day.revenue, 0))} in the last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersStats.total}</div>
            <p className="text-xs text-muted-foreground">
              +{usersStats.newThisMonth} new this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Destinations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{destinationsStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Most booked: {destinationsStats.mostBooked.name}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Booking Trends</CardTitle>
            <CardDescription>Number of bookings over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <LineChart
              data={bookingTrends}
              categories={["bookings"]}
              index="name"
              colors={["amber"]}
              valueFormatter={(value) => `${value} bookings`}
              yAxisWidth={50}
            />
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Revenue over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <BarChart
              data={revenueData}
              categories={["revenue"]}
              index="name"
              colors={["amber"]}
              valueFormatter={(value) => formatPrice(value)}
              yAxisWidth={60}
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Popular Destinations</CardTitle>
            <CardDescription>Most booked destinations</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <PieChart
              data={topDestinations}
              category="value"
              index="name"
              colors={["amber", "indigo", "rose", "cyan", "emerald"]}
              valueFormatter={(value) => `${value} bookings`}
            />
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <PieChart
              data={[
                { name: "Pending", value: bookingsStats.pending },
                { name: "Confirmed", value: bookingsStats.confirmed },
                { name: "Completed", value: bookingsStats.completed },
                { name: "Cancelled", value: bookingsStats.cancelled }
              ]}
              category="value"
              index="name"
              colors={["amber", "green", "blue", "red"]}
              valueFormatter={(value) => `${value} bookings`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsOverview;
