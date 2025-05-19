
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  MapPin, CalendarRange, DollarSign, Briefcase, Users, CreditCard
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type StatsData = {
  totalDestinations: number;
  totalBookings: number;
  pendingBookings: number;
  totalUsers: number;
  revenue: number;
  averageBookingValue: number;
  popularRegions: {name: string, value: number}[];
  bookingTrends: {month: string, bookings: number}[];
  revenueByMonth: {month: string, revenue: number}[];
};

const StatsOverview = () => {
  const [stats, setStats] = useState<StatsData>({
    totalDestinations: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalUsers: 0,
    revenue: 0,
    averageBookingValue: 0,
    popularRegions: [],
    bookingTrends: [],
    revenueByMonth: []
  });
  const [loading, setLoading] = useState(true);

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
        regionResults,
        revenueResults
      ] = await Promise.all([
        // Destinations count
        supabase.from('destinations').select('*', { count: 'exact', head: true }),
        
        // Total bookings
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        
        // Pending bookings
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        
        // User count
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        
        // Region distribution
        supabase.from('destinations').select('region'),
        
        // Revenue data
        supabase.from('bookings').select('price, created_at')
      ]);
      
      // Calculate total revenue from bookings
      const bookingsData = revenueResults.data || [];
      const totalRevenue = bookingsData.reduce((sum, booking) => sum + Number(booking.price), 0);
      const avgBookingValue = bookingsData.length > 0 ? totalRevenue / bookingsData.length : 0;
      
      // Process region distribution
      const regions = regionResults.data?.reduce((acc: {[key: string]: number}, dest) => {
        acc[dest.region] = (acc[dest.region] || 0) + 1;
        return acc;
      }, {});
      
      const regionData = Object.entries(regions || {}).map(([name, value]) => ({ 
        name, 
        value 
      }));
      
      // Generate booking trends by month
      const bookingsByMonth: {[key: string]: number} = {};
      const revenueByMonth: {[key: string]: number} = {};
      
      // Get the last 6 months
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleString('default', { month: 'short' });
        months.push(monthName);
        bookingsByMonth[monthName] = 0;
        revenueByMonth[monthName] = 0;
      }

      // Populate the data
      bookingsData.forEach(booking => {
        const date = new Date(booking.created_at);
        const monthName = date.toLocaleString('default', { month: 'short' });
        if (bookingsByMonth[monthName] !== undefined) {
          bookingsByMonth[monthName] += 1;
          revenueByMonth[monthName] += Number(booking.price);
        }
      });

      // Convert to array format for charts
      const bookingTrendsData = months.map(month => ({
        month,
        bookings: bookingsByMonth[month]
      }));

      const revenueByMonthData = months.map(month => ({
        month,
        revenue: revenueByMonth[month]
      }));
      
      setStats({
        totalDestinations: destResults.count || 0,
        totalBookings: bookingResults.count || 0,
        pendingBookings: pendingResults.count || 0,
        totalUsers: userResults.count || 0,
        revenue: totalRevenue,
        averageBookingValue: avgBookingValue,
        popularRegions: regionData,
        bookingTrends: bookingTrendsData,
        revenueByMonth: revenueByMonthData
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Colors for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28'];
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-travel-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Destinations</p>
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
                <p className="text-sm text-muted-foreground">Bookings</p>
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
                <p className="text-sm text-muted-foreground">Pending</p>
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
                <p className="text-sm text-muted-foreground">Users</p>
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
                <p className="text-sm text-muted-foreground">Revenue</p>
                <h3 className="text-xl font-bold">₹{stats.revenue.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <CreditCard className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Booking</p>
                <h3 className="text-xl font-bold">₹{Math.round(stats.averageBookingValue).toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="trends">
        <TabsList className="w-full max-w-md mb-6">
          <TabsTrigger value="trends">Booking Trends</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="regions">Destination Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Booking Volume</h3>
              <div className="h-80">
                <ChartContainer config={{
                  bookings: { theme: { light: '#8884d8', dark: '#8884d8' } }
                }}>
                  <BarChart data={stats.bookingTrends}>
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
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={stats.revenueByMonth}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#DBA11C" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="regions" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Destinations by Region</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.popularRegions}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.popularRegions.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsOverview;
