import { useState } from 'react';
import { supabaseCustom } from '../utils/supabase-custom';

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  google_maps_url: string;
  office_hours: string;
}

const Contact = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '+1 (555) 123-4567',
    email: 'info@travelhorizon.com',
    address: '123 Adventure St, Wanderlust City, WC 10001',
    google_maps_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2164510008203!2d-73.98780768505079!3d40.758985042561484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855a96da09d%3A0x9eb2dd7ea7eb1f0!2sGrand%20Central%20Terminal!5e0!3m2!1sen!2sus!4v1650000000000!5m2!1sen!2sus',
    office_hours: 'Mon-Fri: 9 AM - 6 PM, Sat: 10 AM - 4 PM'
  });
  const [loading, setLoading] = useState(false);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseCustom
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setContactInfo(data as any);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      // Use default values if unable to fetch
      setContactInfo({
        phone: '+1 (555) 123-4567',
        email: 'info@travelhorizon.com',
        address: '123 Adventure St, Wanderlust City, WC 10001',
        google_maps_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2164510008203!2d-73.98780768505079!3d40.758985042561484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855a96da09d%3A0x9eb2dd7ea7eb1f0!2sGrand%20Central%20Terminal!5e0!3m2!1sen!2sus!4v1650000000000!5m2!1sen!2sus',
        office_hours: 'Mon-Fri: 9 AM - 6 PM, Sat: 10 AM - 4 PM'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Contact component content */}
    </div>
  );
};

export default Contact;