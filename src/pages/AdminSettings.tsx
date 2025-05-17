
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabaseCustom, SiteSettings } from "@/utils/supabase-custom";
import { Loader2 } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    id: 1,
    phone: '',
    email: '',
    address: '',
    google_maps_url: '',
    office_hours: '',
    social_facebook: '',
    social_instagram: '',
    social_twitter: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabaseCustom
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setSettings(data as SiteSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load site settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const { error } = await supabaseCustom
        .from('site_settings')
        .update(settings)
        .eq('id', 1);
        
      if (error) throw error;
      
      toast({
        title: 'Settings updated',
        description: 'Site settings have been successfully saved.',
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update site settings.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-3xl font-bold mb-6">Site Settings</h2>
      
      <form onSubmit={handleSaveSettings}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={settings.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={settings.email}
                  onChange={handleInputChange}
                  placeholder="contact@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Office Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={settings.address}
                  onChange={handleInputChange}
                  placeholder="123 Travel Street, City"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="office_hours">Office Hours</Label>
                <Input
                  id="office_hours"
                  name="office_hours"
                  value={settings.office_hours}
                  onChange={handleInputChange}
                  placeholder="Mon-Fri: 9 AM - 6 PM"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Map & Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Map & Social Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google_maps_url">Google Maps Embed URL</Label>
                <Input
                  id="google_maps_url"
                  name="google_maps_url"
                  value={settings.google_maps_url}
                  onChange={handleInputChange}
                  placeholder="https://www.google.com/maps/embed?..."
                />
                <p className="text-sm text-muted-foreground">
                  Paste the embed URL from Google Maps share function
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="social_facebook">Facebook URL</Label>
                <Input
                  id="social_facebook"
                  name="social_facebook"
                  value={settings.social_facebook || ''}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="social_instagram">Instagram URL</Label>
                <Input
                  id="social_instagram"
                  name="social_instagram"
                  value={settings.social_instagram || ''}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="social_twitter">Twitter URL</Label>
                <Input
                  id="social_twitter"
                  name="social_twitter"
                  value={settings.social_twitter || ''}
                  onChange={handleInputChange}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            type="submit"
            className="bg-travel-gold hover:bg-amber-600 text-black"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
