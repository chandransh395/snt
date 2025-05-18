
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton'; 
import { supabase } from '@/integrations/supabase/client';
import type { SiteSettings } from '@/utils/supabase-custom';

const ContactMap = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('site_settings')
          .select('google_maps_url, google_map_iframe')
          .single();
          
        if (error) throw error;
        
        setSettings(data as SiteSettings);
      } catch (error) {
        console.error('Error fetching map settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <Card className="w-full h-[400px] md:h-[500px] overflow-hidden">
        <Skeleton className="w-full h-full" />
      </Card>
    );
  }

  // If we have an iframe, use that
  if (settings?.google_map_iframe) {
    return (
      <div 
        className="w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg shadow-md" 
        dangerouslySetInnerHTML={{ __html: settings.google_map_iframe }}
      />
    );
  }

  // Fallback to just a linked image if we have a URL but no iframe
  if (settings?.google_maps_url) {
    return (
      <Card className="w-full h-[400px] md:h-[500px] overflow-hidden">
        <a 
          href={settings.google_maps_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ 
              backgroundImage: "url('https://maps.googleapis.com/maps/api/staticmap?center=Your+Location&zoom=13&size=1000x1000&maptype=roadmap&key=YOUR_API_KEY')",
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="flex items-center justify-center w-full h-full bg-black/10">
              <div className="bg-white/90 p-4 rounded-lg shadow-md">
                <p className="text-center">Click to open Google Maps</p>
              </div>
            </div>
          </div>
        </a>
      </Card>
    );
  }

  // Final fallback
  return (
    <Card className="w-full h-[400px] md:h-[500px] overflow-hidden flex items-center justify-center">
      <p className="text-muted-foreground">Map not available</p>
    </Card>
  );
};

export default ContactMap;
