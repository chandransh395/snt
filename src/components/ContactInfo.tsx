
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const ContactInfo = () => {
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    address: '',
    officeHours: ''
  });

  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('email, phone, address, office_hours')
          .single();
          
        if (error) throw error;
        
        if (data) {
          setContactInfo({
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            officeHours: data.office_hours || ''
          });
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      }
    }
    
    fetchContactInfo();
  }, []);

  return (
    <ul className="space-y-3">
      {contactInfo.address && (
        <li className="flex items-start">
          <MapPin className="h-5 w-5 mr-2 text-travel-gold shrink-0 mt-1" />
          <span className="text-gray-300">{contactInfo.address}</span>
        </li>
      )}
      
      {contactInfo.phone && (
        <li className="flex items-center">
          <Phone className="h-5 w-5 mr-2 text-travel-gold shrink-0" />
          <span className="text-gray-300">{contactInfo.phone}</span>
        </li>
      )}
      
      {contactInfo.email && (
        <li className="flex items-center">
          <Mail className="h-5 w-5 mr-2 text-travel-gold shrink-0" />
          <span className="text-gray-300 break-all">{contactInfo.email}</span>
        </li>
      )}
      
      {contactInfo.officeHours && (
        <li className="flex items-start">
          <Clock className="h-5 w-5 mr-2 text-travel-gold shrink-0 mt-1" />
          <span className="text-gray-300">{contactInfo.officeHours}</span>
        </li>
      )}
    </ul>
  );
};

export default ContactInfo;
