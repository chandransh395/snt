
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
        
        // First check if settings record exists
        const { data: existingSettings, error: checkError } = await supabase
          .from('site_settings')
          .select('*');
          
        if (checkError) throw checkError;
        
        if (!existingSettings || existingSettings.length === 0) {
          // Create initial settings with our Google Maps iframe
          const { data, error } = await supabase
            .from('site_settings')
            .insert({
              google_maps_url: 'https://maps.app.goo.gl/vjUQHrxXW6thkx3F9',
              google_map_iframe: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.2233912262824!2d77.2821739749634!3d28.501450493278!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce626851f7009%3A0x621185133cfd1ad1!2sRadha%20Krishna%20Mandir!5e0!3m2!1sen!2sin!4v1715963358983!5m2!1sen!2sin" width="100%" height="500" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
              email: 'contact@travelbooking.com',
              phone: '+91 98765 43210',
              address: 'Radha Krishna Mandir, Surajkund, Faridabad, Haryana 121009, India',
              office_hours: 'Mon-Fri: 9AM-6PM, Sat: 10AM-2PM'
            })
            .select('*')
            .single();
            
          if (error) throw error;
          setSettings(data as SiteSettings);
        } else {
          // Update existing settings with our Google Maps iframe
          const { data, error } = await supabase
            .from('site_settings')
            .update({
              google_maps_url: 'https://maps.app.goo.gl/vjUQHrxXW6thkx3F9',
              google_map_iframe: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.2233912262824!2d77.2821739749634!3d28.501450493278!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce626851f7009%3A0x621185133cfd1ad1!2sRadha%20Krishna%20Mandir!5e0!3m2!1sen!2sin!4v1715963358983!5m2!1sen!2sin" width="100%" height="500" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
            })
            .eq('id', existingSettings[0].id)
            .select('*')
            .single();
            
          if (error) throw error;
          setSettings(data as SiteSettings);
        }
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
              backgroundImage: "url('https://maps.googleapis.com/maps/api/staticmap?center=Radha+Krishna+Mandir&zoom=13&size=1000x1000&maptype=roadmap')",
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
