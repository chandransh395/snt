
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; 
import { Users, ChartBar, Settings, BookMarked, UserCog } from 'lucide-react';
import StatsOverview from '@/components/admin/StatsOverview';
import UserManagement from '@/components/admin/UserManagement';
import { Link } from 'react-router-dom';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your website content and settings</p>
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
                <Button
                  variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                  className={`w-full justify-start rounded-none py-6 px-6 ${activeTab === 'dashboard' ? 'bg-travel-gold text-black' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <ChartBar className="h-5 w-5 mr-3" />
                  Dashboard
                </Button>
                <Button
                  variant={activeTab === 'users' ? 'default' : 'ghost'}
                  className={`w-full justify-start rounded-none py-6 px-6 ${activeTab === 'users' ? 'bg-travel-gold text-black' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  <Users className="h-5 w-5 mr-3" />
                  User Management
                </Button>
                <Link to="/admin/destinations">
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-none py-6 px-6"
                  >
                    <MapPin className="h-5 w-5 mr-3" />
                    Destinations
                  </Button>
                </Link>
                <Link to="/admin/bookings">
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-none py-6 px-6"
                  >
                    <BookMarked className="h-5 w-5 mr-3" />
                    Bookings
                  </Button>
                </Link>
                <Link to="/admin/blog">
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-none py-6 px-6"
                  >
                    <Edit className="h-5 w-5 mr-3" />
                    Blog Manager
                  </Button>
                </Link>
                <Link to="/admin/settings">
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-none py-6 px-6"
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
          {activeTab === 'dashboard' && <StatsOverview />}
          {activeTab === 'users' && <UserManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

import { Edit, MapPin } from 'lucide-react'; // Add missing imports
