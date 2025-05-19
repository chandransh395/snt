
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const PopularDestinations = () => {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularDestinations = async () => {
      try {
        const { data, error } = await supabase
          .from('destinations')
          .select('id, name')
          .eq('top_booked', true)
          .order('bookings_count', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        setDestinations(data || []);
      } catch (error) {
        console.error('Error fetching popular destinations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPopularDestinations();
  }, []);

  if (loading) {
    // Show skeleton loader during loading
    return (
      <ul className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <li key={i} className="animate-pulse">
            <div className="h-5 bg-gray-700 rounded w-3/4"></div>
          </li>
        ))}
      </ul>
    );
  }

  if (destinations.length === 0) {
    return (
      <ul className="space-y-3">
        <li><Link to="/destinations" className="text-gray-300 hover:text-travel-gold transition-colors">No popular destinations yet</Link></li>
      </ul>
    );
  }

  return (
    <ul className="space-y-3">
      {destinations.map(destination => (
        <li key={destination.id}>
          <Link 
            to={`/destinations/${destination.id}`} 
            className="text-gray-300 hover:text-travel-gold transition-colors"
          >
            {destination.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default PopularDestinations;
