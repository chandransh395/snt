import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Grid, Timer, Users, Briefcase, BarChart3, Settings, Globe, FileText, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const [bookingsCount, setBookingsCount] = useState(0);
  const [destinationsCount, setDestinationsCount] = useState(0);
  const [blogPostsCount, setBlogPostsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch counts from different tables
        const fetchTableCount = async (tableName: 'bookings' | 'destinations' | 'blog_posts' | 'profiles') => {
          const { data, error } = await supabase
            .from(tableName)
            .select('count', { count: 'exact', head: true });
          
          if (error) throw error;
          return data?.count || 0;
        };

        const bookingsCountResult = await fetchTableCount('bookings');
        const destinationsCountResult = await fetchTableCount('destinations');
        const blogPostsCountResult = await fetchTableCount('blog_posts');
        const profilesCountResult = await fetchTableCount('profiles');
        
        setBookingsCount(bookingsCountResult as number);
        setDestinationsCount(destinationsCountResult as number);
        setBlogPostsCount(blogPostsCountResult as number);
        setUsersCount(profilesCountResult as number);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You don't have permission to access this page.</p>
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const adminLinks = [
    { name: 'Dashboard', icon: <Grid className="h-5 w-5" />, path: '/admin' },
    { name: 'Destinations', icon: <Globe className="h-5 w-5" />, path: '/admin/destinations' },
    { name: 'Bookings', icon: <Briefcase className="h-5 w-5" />, path: '/admin/bookings' },
    { name: 'Blog Posts', icon: <FileText className="h-5 w-5" />, path: '/admin/blog' },
    { name: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/admin/settings' },
  ];

  const stats = [
    { name: 'Users', value: usersCount, icon: <Users className="h-8 w-8" />, color: 'bg-blue-100 text-blue-600' },
    { name: 'Bookings', value: bookingsCount, icon: <Briefcase className="h-8 w-8" />, color: 'bg-green-100 text-green-600' },
    { name: 'Destinations', value: destinationsCount, icon: <Globe className="h-8 w-8" />, color: 'bg-purple-100 text-purple-600' },
    { name: 'Blog Posts', value: blogPostsCount, icon: <FileText className="h-8 w-8" />, color: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email}
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
            <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div>
            <p className="text-sm font-medium">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${index % 2 === 0 ? 'fadeIn delay-100' : 'fadeIn delay-200'}`}
          >
            <CardContent className="p-6">
              <div className={`inline-flex rounded-lg p-3 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold">
                  {isLoading ? '—' : stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.name}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 fadeIn delay-300">
          <Card className="h-full transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your travel business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {adminLinks.map((link, index) => (
                  <Link key={index} to={link.path}>
                    <Button 
                      variant="outline" 
                      className="w-full h-auto py-4 px-4 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-primary/10 hover:-translate-y-1"
                    >
                      <div className="mb-2">{link.icon}</div>
                      <span>{link.name}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="slideUp delay-200">
          <Card className="h-full transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-2 rounded-md transition-colors hover:bg-muted/50">
                  <div className="rounded-full bg-green-100 p-2">
                    <UserPlus className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New user registered</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-2 rounded-md transition-colors hover:bg-muted/50">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New booking created</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-2 rounded-md transition-colors hover:bg-muted/50">
                  <div className="rounded-full bg-amber-100 p-2">
                    <Timer className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Settings updated</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
