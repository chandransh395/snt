
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  
  // Redirect if not logged in or not an admin
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  const [stats, setStats] = useState({
    totalDestinations: 0,
    totalBookings: 0,
    pendingBookings: 0,
  });
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch total destinations
      const { count: destCount, error: destError } = await supabase
        .from('destinations')
        .select('*', { count: 'exact', head: true });
        
      if (destError) throw destError;
      
      // Fetch total bookings
      const { count: bookingCount, error: bookingError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });
        
      if (bookingError) throw bookingError;
      
      // Fetch pending bookings
      const { count: pendingCount, error: pendingError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
        
      if (pendingError) throw pendingError;
      
      setStats({
        totalDestinations: destCount || 0,
        totalBookings: bookingCount || 0,
        pendingBookings: pendingCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Destinations</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <p className="text-2xl font-bold">{stats.totalDestinations}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <p className="text-2xl font-bold">{stats.totalBookings}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pending Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <p className="text-2xl font-bold">{stats.pendingBookings}</p>
            )}
          </CardContent>
        </Card>
      </div>
      
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
    </div>
  );
};

export default AdminPanel;
