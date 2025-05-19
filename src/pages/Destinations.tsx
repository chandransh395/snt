
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
  }, [selectedRegion, searchQuery]);

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
          <Button 
            onClick={() => {
              // Create sample destination if none exist for demo purposes
              createSampleDestinations();
            }}
            className="mt-4"
          >
            Generate Sample Destinations
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <Card key={destination.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={destination.image || 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=600&q=60'}
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

  // Helper function to create sample destinations if none exist
  async function createSampleDestinations() {
    const sampleDestinations = [
      {
        name: "Santorini, Greece",
        description: "Experience the stunning white-washed buildings, blue domes, and breathtaking sunsets of Santorini. This iconic Greek island offers beautiful beaches, ancient ruins, and world-class dining.",
        image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=60",
        price: "From $1,299",
        region: "europe",
        tags: ["Beach", "Romantic", "Cultural"],
        top_booked: true,
        bookings_count: 125
      },
      {
        name: "Kyoto, Japan",
        description: "Discover the ancient capital of Japan with its traditional temples, serene gardens, and geisha districts. Experience authentic Japanese culture through tea ceremonies and local cuisine.",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=60",
        price: "From $1,499",
        region: "asia",
        tags: ["Cultural", "Historical", "Nature"],
        top_booked: true,
        bookings_count: 98
      },
      {
        name: "Machu Picchu, Peru",
        description: "Explore the ancient Incan citadel set high in the Andes Mountains. This UNESCO World Heritage site offers spectacular views and a glimpse into the sophisticated engineering of the Incan civilization.",
        image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=60",
        price: "From $1,899",
        region: "americas",
        tags: ["Adventure", "Historical", "Nature"],
        top_booked: false,
        bookings_count: 76
      },
      {
        name: "Safari in Serengeti, Tanzania",
        description: "Witness the incredible wildlife of Africa on a safari adventure through the vast plains of Serengeti. Experience the Great Migration and spot the Big Five in their natural habitat.",
        image: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=800&q=60",
        price: "From $2,499",
        region: "africa",
        tags: ["Wildlife", "Adventure", "Nature"],
        top_booked: true,
        bookings_count: 112
      },
      {
        name: "Great Barrier Reef, Australia",
        description: "Dive into the world's largest coral reef system teeming with marine life. Swim alongside tropical fish, turtles, and rays in crystal clear waters of this natural wonder.",
        image: "https://images.unsplash.com/photo-1559751880-8e931718d522?auto=format&fit=crop&w=800&q=60",
        price: "From $1,799",
        region: "oceania",
        tags: ["Beach", "Adventure", "Nature"],
        top_booked: false,
        bookings_count: 85
      },
      {
        name: "Venice, Italy",
        description: "Navigate the romantic canals of Venice in a gondola, admire the stunning architecture, and savor authentic Italian cuisine. This unique city built on water is a must-visit destination.",
        image: "https://images.unsplash.com/photo-1498307833015-e7b400441eb8?auto=format&fit=crop&w=800&q=60",
        price: "From $1,099",
        region: "europe",
        tags: ["Romantic", "Cultural", "Historical"],
        top_booked: true,
        bookings_count: 130
      }
    ];

    try {
      setLoading(true);
      toast({
        title: "Creating sample destinations...",
        description: "Please wait while we set up some sample data."
      });

      // First check if regions exist, if not create them
      const regionsToCreate = [
        { name: "Europe", value: "europe" },
        { name: "Asia", value: "asia" },
        { name: "Americas", value: "americas" },
        { name: "Africa", value: "africa" },
        { name: "Oceania", value: "oceania" }
      ];

      const { data: existingRegions, error: regionCheckError } = await supabase
        .from('regions')
        .select('value');
        
      if (regionCheckError) {
        console.error("Error checking regions:", regionCheckError);
      } else if (!existingRegions || existingRegions.length === 0) {
        // Regions don't exist, create them
        const { error: regionCreateError } = await supabase
          .from('regions')
          .insert(regionsToCreate);
          
        if (regionCreateError) {
          console.error("Error creating regions:", regionCreateError);
        }
      }
      
      // Then create the sample destinations
      const { error } = await supabase
        .from('destinations')
        .insert(sampleDestinations);
        
      if (error) throw error;
      
      await fetchDestinations();
      
      toast({
        title: "Success",
        description: "Sample destinations created successfully!"
      });
    } catch (error: any) {
      console.error("Error creating sample destinations:", error);
      toast({
        title: "Error",
        description: `Failed to create sample destinations: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
};

export default Destinations;
