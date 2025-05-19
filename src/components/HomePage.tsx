
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle, Phone } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import DestinationCard from './DestinationCard';
import { motion } from 'framer-motion';

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
  // State variables for managing top destinations, loading state, and errors
  const [topDestinations, setTopDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effect hook to fetch top destinations when the component mounts
  // The dependency array is empty, so this effect runs only once after the initial render.
  useEffect(() => {
    const fetchTopDestinations = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('destinations')
          .select('*')
          .eq('top_booked', true)
          .order('bookings_count', { ascending: false })
          .limit(5); // Limit to 5 to leave room for "Looking for something else" card
        
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

  // Render an error message if fetching fails
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  // Main JSX structure for the HomePage component
  return (
    <section className="py-16">
      <div className="container mx-auto text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3 font-playfair">Top Destinations</h2>
          <div className="w-20 h-1 bg-travel-gold mx-auto mb-8"></div>
        </motion.div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-travel-gold" />
          </div>
        ) : topDestinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topDestinations.map((destination, index) => (
              <DestinationCard key={destination.id} destination={destination} index={index} />
            ))}
            
            {/* "Looking for something else?" card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: (topDestinations.length) * 0.1 }}
              className="h-full"
            >
              <Card className="overflow-hidden h-full flex flex-col bg-gradient-to-br from-indigo-50 to-amber-50 border-dashed border-travel-gold/30">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                  <div className="rounded-full bg-travel-gold/10 p-6 mb-6">
                    <MessageCircle className="h-12 w-12 text-travel-gold" />
                  </div>
                  
                  <h3 className="text-2xl font-semibold mb-3">Looking for something else?</h3>
                  <p className="text-muted-foreground mb-6">
                    Don't see what you're looking for? Contact our travel experts for personalized recommendations!
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                    <Button asChild className="bg-travel-gold hover:bg-amber-600 text-black">
                      <Link to="/contact">Contact Us</Link>
                    </Button>
                    
                    <Button variant="outline" asChild className="border-travel-gold text-travel-gold hover:bg-travel-gold/10">
                      <a href="tel:+1234567890">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        ) : (
          // Render a message if no top destinations are found
          <div className="text-center py-8">
            <p className="text-muted-foreground">No top destinations found</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Button asChild className="bg-travel-gold hover:bg-amber-600 text-black px-8 py-6 text-lg">
            <Link to="/destinations">View All Destinations</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
