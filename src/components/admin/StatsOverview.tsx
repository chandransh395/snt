
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, MapPin, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, icon, trend }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription className="text-xs text-muted-foreground">
          {description}
          {trend !== undefined && (
            <span className={`ml-2 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

interface RevenueChartProps {
  data: { date: string; revenue: number }[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Analysis</CardTitle>
        <CardDescription>A summary of your website revenue over time</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const StatsOverview = () => {
  const { toast } = useToast();
  const [totalDestinations, setTotalDestinations] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [topRegions, setTopRegions] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number }[]>([]);
  const [timeSpan, setTimeSpan] = useState('monthly'); // Options: daily, weekly, monthly, yearly

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total destinations
        const { data: destinations, error: destError } = await supabase
          .from('destinations')
          .select('*');

        if (destError) throw destError;
        setTotalDestinations(destinations ? destinations.length : 0);

        // Fetch total bookings
        const { data: bookings, error: bookingError } = await supabase
          .from('bookings')
          .select('*');

        if (bookingError) throw bookingError;
        setTotalBookings(bookings ? bookings.length : 0);

        // Fetch total users
        const { data: users, error: userError } = await supabase
          .from('profiles')
          .select('*');

        if (userError) throw userError;
        setTotalUsers(users ? users.length : 0);

        // Fetch top regions
        const { data: regions, error: regionError } = await supabase
          .from('destinations')
          .select('region, count(*)')
          .order('count', { ascending: false })
          .limit(5);

        if (regionError) throw regionError;
        setTopRegions(regions || []);

        // Fetch revenue data (example data)
        const revenue = [
          { date: 'Jan', revenue: 4000 },
          { date: 'Feb', revenue: 3000 },
          { date: 'Mar', revenue: 2000 },
          { date: 'Apr', revenue: 2780 },
          { date: 'May', revenue: 1890 },
          { date: 'Jun', revenue: 2390 },
          { date: 'Jul', revenue: 3490 },
        ];
        setRevenueData(revenue);

      } catch (error: any) {
        console.error('Error fetching statistics:', error);
        toast({
          title: 'Error',
          description: 'Failed to load statistics.',
          variant: 'destructive',
        });
      }
    };

    fetchStats();
  }, [toast]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Destinations"
          value={totalDestinations}
          description="Available places to visit"
          icon={<MapPin />}
        />
        <StatsCard
          title="Total Bookings"
          value={totalBookings}
          description="Number of successful bookings"
          icon={<BookMarked />}
        />
        <StatsCard
          title="Total Users"
          value={totalUsers}
          description="Registered website users"
          icon={<Users />}
        />
        <StatsCard
          title="Top Destinations"
          value={topRegions[0]?.name || '-'}
          description="Most booked region"
          icon={<MapPin />}
          trend={10}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Avg. Group Size"
          value="3.2"
          description="People per booking"
          icon={<Users />}
          trend={5}
        />
        <StatsCard
          title="Lead Conversion"
          value="24%"
          description="From inquiry to booking"
          icon={<TrendingUp />}
          trend={12}
        />
        <StatsCard
          title="Avg. Booking Value"
          value="$1,450"
          description="Per reservation"
          icon={<DollarSign />}
          trend={-3}
        />
      </div>

      <div className="overflow-x-auto h-[400px]">
        <RevenueChart data={revenueData} />
      </div>
    </div>
  );
};

export default StatsOverview;

import { BookMarked } from 'lucide-react';
