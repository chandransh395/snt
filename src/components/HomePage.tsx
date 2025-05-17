
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/utils/currency';

type Destination = {
  id: number;
  name: string;
  region: string;
  image: string;
  description: string;
  price: string;
  tags: string[] | null;
  top_booked: boolean;
  bookings_count: number | null;
};

const HomePage = () => {
  const [topDestinations, setTopDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopDestinations = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('destinations')
          .select('*')
          .eq('top_booked', true)
          .order('bookings_count', { ascending: false })
          .limit(6);
        
        if (error) throw new Error(error.message);
        
        setTopDestinations(data || []);
      } catch (err) {
        console.error('Error fetching top destinations:', err);
        setError('Failed to load top destinations');
      } finally {
        setLoading(false);
      }
    };

    fetchTopDestinations();
  }, []);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Top Booked Destinations</h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : topDestinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topDestinations.map((destination) => (
              <Link 
                key={destination.id} 
                to={`/destinations/${destination.id}`}
                className="block hover:no-underline"
              >
                <Card className="overflow-hidden h-full hover-lift transition-all duration-300 hover:shadow-md">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={destination.image} 
                      alt={destination.name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-amber-500 text-white">Popular</Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{destination.name}</h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground capitalize">{destination.region}</span>
                      <span className="text-sm font-medium">{destination.price}</span>
                    </div>
                    
                    <p className="text-sm line-clamp-3 mb-4">
                      {destination.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {destination.tags?.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No top destinations found</p>
          </div>
        )}
        
        <div className="text-center mt-8">
          <Button asChild className="bg-travel-gold hover:bg-amber-600 text-black">
            <Link to="/destinations">View All Destinations</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
