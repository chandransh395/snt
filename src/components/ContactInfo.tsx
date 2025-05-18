
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { SiteSettings } from '@/utils/supabase-custom';

interface ContactInfoProps {
  variant?: 'full' | 'compact';
}

const ContactInfo = ({ variant = 'full' }: ContactInfoProps) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .single();
          
        if (error) throw error;
        
        setSettings(data as SiteSettings);
      } catch (error) {
        console.error('Error fetching contact settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex items-start space-x-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex items-start space-x-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    );
  }

  if (!settings) {
    return <p className="text-muted-foreground">Contact information not available</p>;
  }

  return (
    <div className={`${variant === 'compact' ? 'space-y-2' : 'space-y-4'}`}>
      {settings.address && (
        <div className="flex items-start space-x-3">
          <MapPin className={`${variant === 'compact' ? 'h-5 w-5' : 'h-6 w-6'} text-travel-gold flex-shrink-0`} />
          <span className={`${variant === 'compact' ? 'text-sm' : ''}`}>{settings.address}</span>
        </div>
      )}
      
      {settings.email && (
        <div className="flex items-start space-x-3">
          <Mail className={`${variant === 'compact' ? 'h-5 w-5' : 'h-6 w-6'} text-travel-gold flex-shrink-0`} />
          <span className={`${variant === 'compact' ? 'text-sm' : ''}`}>{settings.email}</span>
        </div>
      )}
      
      {settings.phone && (
        <div className="flex items-start space-x-3">
          <Phone className={`${variant === 'compact' ? 'h-5 w-5' : 'h-6 w-6'} text-travel-gold flex-shrink-0`} />
          <span className={`${variant === 'compact' ? 'text-sm' : ''}`}>{settings.phone}</span>
        </div>
      )}
      
      {settings.office_hours && (
        <div className="flex items-start space-x-3">
          <Clock className={`${variant === 'compact' ? 'h-5 w-5' : 'h-6 w-6'} text-travel-gold flex-shrink-0`} />
          <span className={`${variant === 'compact' ? 'text-sm' : ''}`}>{settings.office_hours}</span>
        </div>
      )}
    </div>
  );
};

export default ContactInfo;
