
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  DollarSign, 
  MapPin, 
  TrendingUp, 
  Users, 
  BookMarked,
  Activity,
  ChartBar,
  Database
} from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, icon, trend, trendLabel, color = "bg-blue-500" }) => {
  return (
    <Card>
      <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2`}>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-full p-2 ${color} bg-opacity-20`}>
          {React.cloneElement(icon as React.ReactElement, { className: `h-4 w-4 text-${color.replace('bg-', '')}` })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription className="text-xs text-muted-foreground flex items-center">
          {description}
          {trend !== undefined && (
            <span className={`ml-2 flex items-center ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '+' : ''}{trend}%
              {trendLabel && <span className="ml-1 text-muted-foreground">({trendLabel})</span>}
            </span>
          )}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#D946EF', '#F97316'];

const StatsOverview = () => {
  const { toast } = useToast();
  const [totalDestinations, setTotalDestinations] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [topRegions, setTopRegions] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number }[]>([]);
  const [bookingsByRegion, setBookingsByRegion] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [bookingTrend, setBookingTrend] = useState(0);
  const [userTrend, setUserTrend] = useState(0);
  const [revenueTrend, setRevenueTrend] = useState(0);
  const [timeSpan, setTimeSpan] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [timeSpan]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch total destinations
      const { data: destinations, error: destError } = await supabase
        .from('destinations')
        .select('id, region, bookings_count');

      if (destError) throw destError;
      setTotalDestinations(destinations ? destinations.length : 0);
      
      // Process regions data for pie chart
      if (destinations && destinations.length > 0) {
        const regionCounts: Record<string, number> = {};
        destinations.forEach(dest => {
          regionCounts[dest.region] = (regionCounts[dest.region] || 0) + (dest.bookings_count || 0);
        });
        
        const regionData = Object.keys(regionCounts).map(region => ({
          name: region,
          value: regionCounts[region]
        })).sort((a, b) => b.value - a.value);
        
        setBookingsByRegion(regionData);
        setTopRegions(regionData.slice(0, 5));
      }

      // Fetch total bookings
      const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select('id, created_at, price, destination_id, status');

      if (bookingError) throw bookingError;
      setTotalBookings(bookings ? bookings.length : 0);
      
      // Calculate booking trend (example: 15% increase)
      setBookingTrend(15);

      // Fetch total users
      const { data: users, error: userError } = await supabase
        .from('user_profiles')
        .select('id, created_at');

      if (userError) throw userError;
      setTotalUsers(users ? users.length : 0);
      
      // Calculate user trend (example: 8% increase)
      setUserTrend(8);
      
      // Generate user growth data
      const userGrowthData = generateTimeSeriesData('users', timeSpan);
      setUserGrowth(userGrowthData);

      // Generate revenue data based on timeSpan
      const revenue = generateTimeSeriesData('revenue', timeSpan);
      setRevenueData(revenue);
      
      // Calculate revenue trend (example: 12% increase)
      setRevenueTrend(12);

    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load statistics.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate sample time series data based on the selected time span
  const generateTimeSeriesData = (type: 'revenue' | 'bookings' | 'users', span: string) => {
    const now = new Date();
    const data: any[] = [];
    
    let labels: string[] = [];
    let baseValue = type === 'revenue' ? 2000 : type === 'users' ? 10 : 5;
    let fluctuation = type === 'revenue' ? 800 : type === 'users' ? 5 : 3;
    
    if (span === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      }
    } else if (span === 'weekly') {
      // Last 4 weeks
      for (let i = 4; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - (i * 7));
        labels.push(`Week ${4-i+1}`);
      }
    } else if (span === 'monthly') {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(now.getMonth() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
      }
    } else if (span === 'yearly') {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const date = new Date();
        date.setFullYear(now.getFullYear() - i);
        labels.push(date.getFullYear().toString());
      }
    }
    
    // Generate data with some randomness for realistic trends
    labels.forEach(label => {
      const value = baseValue + Math.random() * fluctuation;
      if (type === 'revenue') {
        data.push({ date: label, revenue: Math.round(value) * 100 });
      } else if (type === 'users') {
        data.push({ date: label, users: Math.round(value) });
      } else {
        data.push({ date: label, bookings: Math.round(value) });
      }
    });
    
    return data;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <Select value={timeSpan} onValueChange={setTimeSpan}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Destinations"
          value={totalDestinations}
          description="Available places"
          icon={<MapPin />}
          color="bg-purple-500"
        />
        <StatsCard
          title="Total Bookings"
          value={totalBookings}
          description="Successful reservations"
          icon={<BookMarked />}
          trend={bookingTrend}
          trendLabel="from last period"
          color="bg-amber-500"
        />
        <StatsCard
          title="Total Users"
          value={totalUsers}
          description="Registered accounts"
          icon={<Users />}
          trend={userTrend}
          trendLabel="from last period"
          color="bg-blue-500"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${(totalBookings * 750).toLocaleString()}`}
          description="Estimated earnings"
          icon={<DollarSign />}
          trend={revenueTrend}
          trendLabel="from last period"
          color="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Financial performance analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`$${value}`, 'Revenue']} 
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    fill="url(#colorRevenue)" 
                    activeDot={{ r: 8 }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bookings by Region</CardTitle>
            <CardDescription>Distribution of bookings across regions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingsByRegion}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {bookingsByRegion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend layout="vertical" verticalAlign="middle" align="right" />
                  <Tooltip formatter={(value: any) => [`${value} bookings`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#00C49F" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key business indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={[
                    { name: 'Conversion', value: 24 },
                    { name: 'Retention', value: 68 },
                    { name: 'Engagement', value: 42 },
                    { name: 'Satisfaction', value: 86 }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value}%`, 'Rate']} />
                  <Legend />
                  <Bar dataKey="value" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatsCard
          title="Avg. Group Size"
          value="3.2"
          description="People per booking"
          icon={<Users />}
          trend={2}
          color="bg-teal-500"
        />
        <StatsCard
          title="Lead Conversion"
          value="24%"
          description="From inquiry to booking"
          icon={<TrendingUp />}
          trend={5}
          color="bg-blue-500"
        />
        <StatsCard
          title="Avg. Booking Value"
          value="$1,450"
          description="Per reservation"
          icon={<DollarSign />}
          trend={-2}
          color="bg-emerald-500"
        />
        <StatsCard
          title="Repeat Customers"
          value="32%"
          description="Return rate"
          icon={<Activity />}
          trend={8}
          color="bg-indigo-500"
        />
      </div>
    </div>
  );
};

export default StatsOverview;
