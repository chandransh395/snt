
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Search, Loader2, BadgeCheck, Trophy, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/utils/currency';
import LookingForElseCard from '@/components/LookingForElseCard';
import DestinationCard from '@/components/DestinationCard';
import { motion } from 'framer-motion';

interface Destination {
  id: number;
  name: string;
  description: string;
  image: string;
  price: string;
  region: string;
  tags: string[];
  top_booked: boolean;
  bookings_count: number;
}

const Destinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [regions, setRegions] = useState<{ value: string; label: string; }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDestinations();
    fetchRegions();
  }, [selectedRegion, searchQuery]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('destinations')
        .select('*')
        .order('name', { ascending: true });

      if (selectedRegion && selectedRegion !== 'all-regions') {
        query = query.eq('region', selectedRegion);
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setDestinations(data as Destination[]);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load destinations.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('value, name');

      if (error) throw error;

      if (data && data.length > 0) {
        setRegions(data.map(region => ({
          value: region.value,
          label: region.name,
        })));
      } else {
        // Fallback regions if none exist in database
        setRegions([
          { value: 'europe', label: 'Europe' },
          { value: 'asia', label: 'Asia' },
          { value: 'americas', label: 'Americas' },
          { value: 'africa', label: 'Africa' },
          { value: 'oceania', label: 'Oceania' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
      // Set default regions as fallback
      setRegions([
        { value: 'europe', label: 'Europe' },
        { value: 'asia', label: 'Asia' },
        { value: 'americas', label: 'Americas' },
        { value: 'africa', label: 'Africa' },
        { value: 'oceania', label: 'Oceania' }
      ]);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
  };

  // Trust features to display
  const trustFeatures = [
    { icon: <Trophy className="h-5 w-5 text-amber-500" />, text: "Award-Winning Tours" },
    { icon: <BadgeCheck className="h-5 w-5 text-green-500" />, text: "Verified Activities" },
    { icon: <Shield className="h-5 w-5 text-blue-500" />, text: "Safe Travel Guarantee" },
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <motion.header 
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-3 text-center font-playfair">Explore Destinations</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-center mb-5">Discover your perfect adventure from our handpicked collection of breathtaking destinations</p>
        
        {/* Trust features */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {trustFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (index * 0.1) }}
              className="verification-badge"
            >
              {feature.icon}
              <span>{feature.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.header>

      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-6 mb-10 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 items-center">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 h-12 border-travel-gold/30 focus-within:border-travel-gold/70"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          </div>

          <div>
            <Select value={selectedRegion} onValueChange={handleRegionChange}>
              <SelectTrigger className="w-full h-12 border-travel-gold/30 focus:border-travel-gold/70">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-regions">All Regions</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-travel-gold" />
        </div>
      ) : destinations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl shadow-sm">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">No Destinations Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {searchQuery || selectedRegion
              ? 'Try adjusting your search or filter options.'
              : 'No destinations available at the moment.'}
          </p>
          {searchQuery || selectedRegion ? (
            <Button 
              onClick={() => { 
                setSearchQuery(''); 
                setSelectedRegion('');
              }} 
              variant="outline"
              className="border-travel-gold text-travel-gold hover:bg-travel-gold/10"
            >
              Clear Filters
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <DestinationCard 
                destination={destination} 
                index={index} 
              />
            </motion.div>
          ))}
          {/* Add the LookingForElseCard as the last card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: destinations.length * 0.05 }}
          >
            <LookingForElseCard darkTheme={true} />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Destinations;
