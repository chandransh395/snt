
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/utils/currency';
import LookingForElseCard from '@/components/LookingForElseCard';
import DestinationCard from '@/components/DestinationCard';

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

  const handleCardClick = (id: number) => {
    navigate(`/destinations/${id}`);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Destinations</h1>
        <p className="text-muted-foreground">Discover your next adventure</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        </div>

        <div>
          <Label htmlFor="region">Filter by Region</Label>
          <Select value={selectedRegion} onValueChange={handleRegionChange}>
            <SelectTrigger className="w-full">
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

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-travel-gold" />
        </div>
      ) : destinations.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No Destinations Found</h2>
          <p className="text-muted-foreground">
            {searchQuery || selectedRegion
              ? 'Try adjusting your search or filter options.'
              : 'No destinations available at the moment.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination, index) => (
            <DestinationCard 
              key={destination.id} 
              destination={destination} 
              index={index} 
            />
          ))}
          {/* Add the LookingForElseCard as the last card */}
          <LookingForElseCard darkTheme={true} />
        </div>
      )}
    </div>
  );
};

export default Destinations;
