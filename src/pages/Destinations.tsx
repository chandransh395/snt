import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  useEffect(() => {
    fetchDestinations();
    fetchRegions();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('destinations')
        .select('*')
        .order('name', { ascending: true });

      if (selectedRegion) {
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

      if (data) {
        setRegions(data.map(region => ({
          value: region.value,
          label: region.name,
        })));
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load regions.',
        variant: 'destructive',
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    fetchDestinations();
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    fetchDestinations();
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
              <SelectItem value="">All Regions</SelectItem>
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
              : 'Check back soon as we add more destinations.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <Card key={destination.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2">
                  {destination.top_booked && (
                    <span className="bg-travel-gold text-black text-xs font-semibold py-1 px-2 rounded-md">
                      Top Booked
                    </span>
                  )}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-xl line-clamp-1">{destination.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {destination.region}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3">{destination.description}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <p className="text-xl font-semibold text-travel-gold">{formatPrice(destination.price)}</p>
                <Link to={`/booking/${destination.id}`}>
                  <Button>Book Now</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
          {/* Add the LookingForElseCard as the last card */}
          <LookingForElseCard darkTheme={true} />
        </div>
      )}
    </div>
  );
};

export default Destinations;
