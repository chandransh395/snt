import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Users, MapPin, BookOpen, Settings, Calendar } from 'lucide-react';
import { supabaseCustom } from '@/utils/supabase-custom';

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  
  const [userCount, setUserCount] = useState<number | null>(null);
  const [destinationCount, setDestinationCount] = useState<number | null>(null);
  const [bookingCount, setBookingCount] = useState<number | null>(null);
  const [blogCount, setBlogCount] = useState<number | null>(null);
  
  const [usersLoading, setUsersLoading] = useState(true);
  const [destinationsLoading, setDestinationsLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [blogLoading, setBlogLoading] = useState(true);
  
  const [profilesError, setProfilesError] = useState(false);
  const [destinationsError, setDestinationsError] = useState(false);
  const [bookingsError, setBookingsError] = useState(false);
  const [blogError, setBlogError] = useState(false);
  
  // Redirect if not logged in or not an admin
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  useEffect(() => {
    fetchUserCount();
    fetchDestinationCount();
    fetchBookingCount();
    fetchBlogCount();
  }, []);
  
  const fetchUserCount = async () => {
    try {
      setUsersLoading(true);
      const { count, error } = await supabaseCustom
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (error) throw error;
      setUserCount(count);
    } catch (error) {
      console.error('Error fetching user count:', error);
      setProfilesError(true);
    } finally {
      setUsersLoading(false);
    }
  };
  
  const fetchDestinationCount = async () => {
    try {
      setDestinationsLoading(true);
      const { count, error } = await supabaseCustom
        .from('destinations')
        .select('*', { count: 'exact', head: true });
        
      if (error) throw error;
      setDestinationCount(count);
    } catch (error) {
      console.error('Error fetching destination count:', error);
      setDestinationsError(true);
    } finally {
      setDestinationsLoading(false);
    }
  };
  
  const fetchBookingCount = async () => {
    try {
      setBookingsLoading(true);
      const { count, error } = await supabaseCustom
        .from('bookings')
        .select('*', { count: 'exact', head: true });
        
      if (error) throw error;
      setBookingCount(count);
    } catch (error) {
      console.error('Error fetching booking count:', error);
      setBookingsError(true);
    } finally {
      setBookingsLoading(false);
    }
  };
  
  const fetchBlogCount = async () => {
    try {
      setBlogLoading(true);
      const { count, error } = await supabaseCustom
        .from('blog_posts')
        .select('*', { count: 'exact', head: true });
        
      if (error) throw error;
      setBlogCount(count);
    } catch (error) {
      console.error('Error fetching blog count:', error);
      setBlogError(true);
    } finally {
      setBlogLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : profilesError ? (
              <div className="text-red-500 text-sm">Error loading user counts</div>
            ) : (
              <div className="text-2xl font-bold">{userCount}</div>
            )}
          </CardContent>
        </Card>
        
        {/* Destinations Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destinations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {destinationsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : destinationsError ? (
              <div className="text-red-500 text-sm">Error loading destination counts</div>
            ) : (
              <div className="text-2xl font-bold">{destinationCount}</div>
            )}
          </CardContent>
        </Card>
        
        {/* Bookings Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : bookingsError ? (
              <div className="text-red-500 text-sm">Error loading booking counts</div>
            ) : (
              <div className="text-2xl font-bold">{bookingCount}</div>
            )}
          </CardContent>
        </Card>
        
        {/* Blog Posts Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {blogLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : blogError ? (
              <div className="text-red-500 text-sm">Error loading blog counts</div>
            ) : (
              <div className="text-2xl font-bold">{blogCount}</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="content">
        <TabsList className="mb-8">
          <TabsTrigger value="content">Content Management</TabsTrigger>
          <TabsTrigger value="bookings">Booking Management</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Destinations</CardTitle>
                <CardDescription>
                  Manage travel destinations, add new locations, or update existing ones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You have {destinationCount} destinations in your database. Add new destinations or edit existing ones.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to="/admin/destinations">Manage Destinations</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Blog Posts</CardTitle>
                <CardDescription>
                  Create and manage blog content for your travel website.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You have {blogCount} blog posts published. Create new content or edit existing posts.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to="/admin/blog">Manage Blog</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Booking Management</CardTitle>
              <CardDescription>
                View and manage customer bookings and reservations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You have {bookingCount} bookings in your system. View details, update status, or manage customer requests.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/admin/bookings">Manage Bookings</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>
                Configure global settings for your travel website.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Update contact information, social media links, and other site-wide settings.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/admin/settings">Manage Settings</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
