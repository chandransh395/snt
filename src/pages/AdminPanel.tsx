
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; 
import { ChartBar, Settings, BookMarked, MapPin, Edit } from 'lucide-react';
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
        {/* Main Content */}
        <div className="lg:col-span-12">
          <Tabs defaultValue="dashboard" onValueChange={value => setActiveTab(value)}>
            <TabsList className="mb-6">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <ChartBar className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Users</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <StatsOverview />
            </TabsContent>
            
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
