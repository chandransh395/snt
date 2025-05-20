
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart } from '@/components/ui/charts';
import { Loader2, TrendingUp, TrendingDown, Users, MapPin, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/utils/currency';
import { getDateRange, formatBookingData, formatDestinationData, calculateBookingStats } from '@/utils/admin-utils';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/DatePicker';
import { addDays } from 'date-fns';

const StatsOverview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingsStats, setBookingsStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
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
  
  const [timeFrame, setTimeFrame] = useState<'7days' | '30days' | '90days' | 'custom'>('7days');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  
  const [bookingTrends, setBookingTrends] = useState<any[]>([]);
  const [topDestinations, setTopDestinations] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [bookingStatusData, setBookingStatusData] = useState<any[]>([]);
  
  useEffect(() => {
    fetchStatistics();
  }, [timeFrame, customStartDate, customEndDate]);
  
  const handleTimeFrameChange = (value: string) => {
    if (value === 'custom') {
      // Default to last 7 days when switching to custom
      if (!customStartDate) {
        setCustomStartDate(addDays(new Date(), -7));
        setCustomEndDate(new Date());
      }
      setShowCustomDatePicker(true);
    } else {
      setTimeFrame(value as '7days' | '30days' | '90days');
      setShowCustomDatePicker(false);
    }
  };
  
  const applyCustomDateRange = () => {
    if (customStartDate && customEndDate) {
      setTimeFrame('custom');
    }
  };
  
  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get date range for queries
      const dateRange = getDateRange(timeFrame, customStartDate, customEndDate);
      const startDateStr = dateRange[0];
      const endDateStr = dateRange[dateRange.length - 1];
      
      // Fetch bookings statistics within date range
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, destination_name, status, created_at, price, num_travelers')
        .gte('created_at', `${startDateStr}T00:00:00`)
        .lte('created_at', `${endDateStr}T23:59:59`);
        
      if (bookingsError) throw bookingsError;
      
      // Fetch all bookings for status counts
      const { data: allBookingsData, error: allBookingsError } = await supabase
        .from('bookings')
        .select('id, status, price');
        
      if (allBookingsError) throw allBookingsError;
      
      // Calculate booking stats
      const stats = calculateBookingStats(allBookingsData || []);
      setBookingsStats(stats);
      
      // Set status data for pie chart
      setBookingStatusData([
        { name: "Pending", value: stats.pending },
        { name: "Confirmed", value: stats.confirmed },
        { name: "Completed", value: stats.completed },
        { name: "Cancelled", value: stats.cancelled }
      ]);
      
      // Format booking trends data
      const trendsData = formatBookingData(bookingsData || [], dateRange);
      setBookingTrends(trendsData);
      setRevenueData(trendsData);
      
      // Fetch users statistics
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, created_at');
        
      if (profilesError) throw profilesError;
      
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const newUsers = (profilesData || []).filter(user => 
        new Date(user.created_at) >= firstDayOfMonth
      );
      
      setUsersStats({
        total: profilesData?.length || 0,
        newThisMonth: newUsers.length
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
        const formattedDestinations = formatDestinationData(destinationsData);
        setTopDestinations(formattedDestinations);
      }
      
      setDestinationsStats({
        total: destinationsData?.length || 0,
        mostBooked
      });
      
    } catch (error: any) {
      console.error('Error fetching admin statistics:', error);
      setError(error.message || 'An error occurred while fetching data');
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
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error Loading Data</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Button onClick={fetchStatistics}>Retry</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Time period selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs defaultValue={timeFrame} onValueChange={handleTimeFrameChange} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="7days">7 Days</TabsTrigger>
            <TabsTrigger value="30days">30 Days</TabsTrigger>
            <TabsTrigger value="90days">90 Days</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {showCustomDatePicker && (
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm">From:</span>
              <DatePicker
                selected={customStartDate}
                onChange={date => setCustomStartDate(date)}
                maxDate={new Date()}
                className="w-[180px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">To:</span>
              <DatePicker
                selected={customEndDate}
                onChange={date => setCustomEndDate(date)}
                minDate={customStartDate}
                maxDate={new Date()}
                className="w-[180px]"
              />
            </div>
            <Button 
              size="sm" 
              onClick={applyCustomDateRange}
              disabled={!customStartDate || !customEndDate}
            >
              Apply
            </Button>
          </div>
        )}
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
              +{bookingTrends.reduce((sum, day) => sum + day.bookings, 0)} in the selected period
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
              {formatPrice(revenueData.reduce((sum, day) => sum + day.revenue, 0))} in the selected period
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
          <CardContent className="h-[300px]">
            <LineChart
              data={bookingTrends}
              categories={["bookings"]}
              index="name"
              colors={["amber"]}
              valueFormatter={(value) => `${value} bookings`}
              yAxisWidth={60}
              height={250}
              emptyMessage="No booking data available for the selected period"
            />
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Revenue over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <BarChart
              data={revenueData}
              categories={["revenue"]}
              index="name"
              colors={["amber"]}
              valueFormatter={(value) => formatPrice(value)}
              yAxisWidth={80}
              height={250}
              emptyMessage="No revenue data available for the selected period"
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
          <CardContent className="h-[300px]">
            <PieChart
              data={topDestinations}
              category="value"
              index="name"
              colors={["amber", "indigo", "rose", "cyan", "emerald"]}
              valueFormatter={(value) => `${value} bookings`}
              height={250}
              emptyMessage="No destination booking data available"
            />
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <PieChart
              data={bookingStatusData}
              category="value"
              index="name"
              colors={["amber", "green", "blue", "red"]}
              valueFormatter={(value) => `${value} bookings`}
              height={250}
              emptyMessage="No booking status data available"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsOverview;
