
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

interface SiteSettings {
  id: string;
  phone: string;
  email: string;
  address: string;
  google_maps_url: string;
  office_hours: string;
}

const AdminSettings = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<SiteSettings>({
    id: '1',
    phone: '',
    email: '',
    address: '',
    google_maps_url: '',
    office_hours: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Redirect if not logged in or not an admin
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', '1')
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch site settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };
  
  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('site_settings')
        .upsert(settings, { onConflict: 'id' });
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Site settings saved successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save site settings.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Site Settings</h1>
      
      <Button 
        onClick={() => window.history.back()} 
        variant="outline"
        className="mb-8"
      >
        Back to Admin Panel
      </Button>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Tabs defaultValue="contact">
          <TabsList className="mb-8">
            <TabsTrigger value="contact">Contact Information</TabsTrigger>
          </TabsList>
          
          <TabsContent value="contact">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Update your business contact details that will be displayed throughout the site.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="e.g. +91 750-061-5426"
                      value={settings.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="example@yourdomain.com"
                      value={settings.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Office Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="Enter your full office address"
                      value={settings.address}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="office_hours">Office Hours</Label>
                    <Input
                      id="office_hours"
                      name="office_hours"
                      placeholder="e.g. Monday-Friday, 9am-5pm"
                      value={settings.office_hours}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="google_maps_url">Google Maps Embed URL</Label>
                    <Input
                      id="google_maps_url"
                      name="google_maps_url"
                      placeholder="https://www.google.com/maps/embed?..."
                      value={settings.google_maps_url}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter the Google Maps embed URL for your location to display on the contact page.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button 
                onClick={saveSettings} 
                disabled={saving}
                className="bg-travel-gold hover:bg-amber-600 text-black"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : 'Save Settings'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminSettings;
