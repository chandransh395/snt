
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ChartBar, Users, Settings, BookMarked, Edit, MapPin, Home } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const path = location.pathname;
  
  const isActive = (route: string) => {
    if (route === '/admin' && path === '/admin') return true;
    if (route !== '/admin' && path.startsWith(route)) return true;
    return false;
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your website content and settings</p>
        </div>
        <Link to="/">
          <Button variant="outline" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>Return to Website</span>
          </Button>
        </Link>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <Card className="sticky top-24">
            <CardHeader className="py-4 px-6">
              <CardTitle className="text-xl">Admin Controls</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav>
                <Link to="/admin">
                  <Button
                    variant={isActive('/admin') ? 'default' : 'ghost'}
                    className={`w-full justify-start rounded-none py-6 px-6 ${isActive('/admin') ? 'bg-travel-gold text-black' : ''}`}
                  >
                    <ChartBar className="h-5 w-5 mr-3" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/admin/users">
                  <Button
                    variant={isActive('/admin/users') ? 'default' : 'ghost'}
                    className={`w-full justify-start rounded-none py-6 px-6 ${isActive('/admin/users') ? 'bg-travel-gold text-black' : ''}`}
                  >
                    <Users className="h-5 w-5 mr-3" />
                    User Management
                  </Button>
                </Link>
                <Link to="/admin/destinations">
                  <Button
                    variant={isActive('/admin/destinations') ? 'default' : 'ghost'}
                    className={`w-full justify-start rounded-none py-6 px-6 ${isActive('/admin/destinations') ? 'bg-travel-gold text-black' : ''}`}
                  >
                    <MapPin className="h-5 w-5 mr-3" />
                    Destinations
                  </Button>
                </Link>
                <Link to="/admin/bookings">
                  <Button
                    variant={isActive('/admin/bookings') ? 'default' : 'ghost'}
                    className={`w-full justify-start rounded-none py-6 px-6 ${isActive('/admin/bookings') ? 'bg-travel-gold text-black' : ''}`}
                  >
                    <BookMarked className="h-5 w-5 mr-3" />
                    Bookings
                  </Button>
                </Link>
                <Link to="/admin/blog">
                  <Button
                    variant={isActive('/admin/blog') ? 'default' : 'ghost'}
                    className={`w-full justify-start rounded-none py-6 px-6 ${isActive('/admin/blog') ? 'bg-travel-gold text-black' : ''}`}
                  >
                    <Edit className="h-5 w-5 mr-3" />
                    Blog Manager
                  </Button>
                </Link>
                <Link to="/admin/settings">
                  <Button
                    variant={isActive('/admin/settings') ? 'default' : 'ghost'}
                    className={`w-full justify-start rounded-none py-6 px-6 ${isActive('/admin/settings') ? 'bg-travel-gold text-black' : ''}`}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Site Settings
                  </Button>
                </Link>
              </nav>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-9">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
