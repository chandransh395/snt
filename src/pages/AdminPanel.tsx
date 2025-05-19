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
        {/* Sidebar is moved to AdminLayout.tsx */}
        
        {/* Main Content */}
        <div className="lg:col-span-12">
          {activeTab === 'dashboard' && <StatsOverview />}
          {activeTab === 'users' && <UserManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
