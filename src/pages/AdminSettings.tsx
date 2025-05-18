// Imports
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SiteSettings } from '@/utils/supabase-custom';

const AdminSettings = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<SiteSettings>({
    id: 1,
    phone: '',
    email: '',
    address: '',
    google_maps_url: '',
    google_map_iframe: '',
    office_hours: '',
    social_facebook: '',
    social_instagram: '',
    social_twitter: '',
    updated_at: new Date().toISOString(), // Added the missing field
  });
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Redirect if not logged in or not an admin
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .single();
          
        if (error) throw error;
        
        if (data) {
          setSettings(data as SiteSettings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load settings.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [toast]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };
  
  // Save settings
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('site_settings')
        .update({
          phone: settings.phone,
          email: settings.email,
          address: settings.address,
          google_maps_url: settings.google_maps_url,
          google_map_iframe: settings.google_map_iframe,
          office_hours: settings.office_hours,
          social_facebook: settings.social_facebook,
          social_instagram: settings.social_instagram,
          social_twitter: settings.social_twitter,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Settings saved successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Site Settings</h1>
      
      <Button 
        onClick={() => window.history.back()} 
        variant="outline"
        className="mb-6"
      >
        Back to Admin Panel
      </Button>
      
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="contact" className="space-y-8">
            <TabsList>
              <TabsTrigger value="contact">Contact Information</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
            </TabsList>
            
            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Update the contact details that appear on your website.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone"
                      name="phone"
                      value={settings.phone}
                      onChange={handleChange}
                      placeholder="+1 (123) 456-7890"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      value={settings.email}
                      onChange={handleChange}
                      placeholder="contact@yourtravel.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea 
                      id="address"
                      name="address"
                      value={settings.address}
                      onChange={handleChange}
                      placeholder="123 Travel Street, City, Country"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="office_hours">Office Hours</Label>
                    <Input 
                      id="office_hours"
                      name="office_hours"
                      value={settings.office_hours}
                      onChange={handleChange}
                      placeholder="Mon-Fri: 9AM - 5PM"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="google_maps_url">Google Maps URL</Label>
                    <Input 
                      id="google_maps_url"
                      name="google_maps_url"
                      value={settings.google_maps_url}
                      onChange={handleChange}
                      placeholder="https://goo.gl/maps/..."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="google_map_iframe">Google Maps Embed HTML (iframe)</Label>
                    <Textarea 
                      id="google_map_iframe"
                      name="google_map_iframe"
                      value={settings.google_map_iframe || ''}
                      onChange={handleChange}
                      placeholder="<iframe src='https://www.google.com/maps/embed?...'></iframe>"
                      className="font-mono text-sm"
                      rows={4}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Paste the full iframe HTML code from Google Maps embed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="social" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Social Media</CardTitle>
                  <CardDescription>
                    Connect your social media accounts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="social_facebook">Facebook</Label>
                    <Input 
                      id="social_facebook"
                      name="social_facebook"
                      value={settings.social_facebook || ''}
                      onChange={handleChange}
                      placeholder="https://facebook.com/yourtravelpage"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="social_instagram">Instagram</Label>
                    <Input 
                      id="social_instagram"
                      name="social_instagram"
                      value={settings.social_instagram || ''}
                      onChange={handleChange}
                      placeholder="https://instagram.com/yourtravelpage"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="social_twitter">Twitter</Label>
                    <Input 
                      id="social_twitter"
                      name="social_twitter"
                      value={settings.social_twitter || ''}
                      onChange={handleChange}
                      placeholder="https://twitter.com/yourtravelpage"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <CardFooter className="px-0">
              <Button 
                type="submit" 
                disabled={isSaving}
                className="bg-travel-gold hover:bg-amber-600 text-black"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Tabs>
        </form>
      )}
    </div>
  );
};

export default AdminSettings;
