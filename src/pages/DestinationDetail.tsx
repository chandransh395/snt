
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Users, Check, MapPin } from 'lucide-react';

interface ItineraryDay {
  day: string;
  title: string;
  description: string;
}

interface Destination {
  id: number;
  name: string;
  region: string;
  image: string;
  description: string;
  price: string;
  tags: string[] | null;
  duration_days?: number;
  itinerary?: ItineraryDay[];
}

const DestinationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      fetchDestination(parseInt(id));
    }
  }, [id]);
  
  const fetchDestination = async (destinationId: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('id', destinationId)
        .single();
        
      if (error) throw error;
      setDestination(data);
    } catch (error) {
      console.error('Error fetching destination:', error);
      toast({
        title: 'Error',
        description: 'Failed to load destination details.',
        variant: 'destructive',
      });
      navigate('/destinations');
    } finally {
      setLoading(false);
    }
  };
  
  // Default included features
  const included = [
    "Accommodation in 4-star hotels",
    "Daily breakfast and selected meals",
    "All transfers and transportation",
    "English-speaking local guides",
    "Entrance fees to attractions",
    "Welcome dinner with cultural performance"
  ];
  
  // Default not included features
  const notIncluded = [
    "International airfare",
    "Travel insurance",
    "Personal expenses",
    "Optional activities not mentioned in the itinerary",
    "Alcoholic beverages"
  ];
  
  if (loading) {
    return (
      <div className="container mx-auto py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!destination) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Destination Not Found</h2>
        <p className="mb-8">The destination you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/destinations')}>
          Browse All Destinations
        </Button>
      </div>
    );
  }

  // Get itinerary from destination data or use default if not available
  const itinerary = destination.itinerary && destination.itinerary.length > 0 
    ? destination.itinerary 
    : [
      {
        day: "Day 1-2",
        title: "Arrival & Exploration",
        description: "Arrive at your destination and check in to your accommodation. Spend the first two days exploring the local area and getting oriented."
      },
      {
        day: "Day 3-4",
        title: "Cultural Immersion",
        description: "Visit historic sites, museums, and landmarks. Experience local traditions and sample authentic cuisine."
      },
      {
        day: "Day 5-6",
        title: "Nature & Adventure",
        description: "Explore natural attractions with guided excursions. Options for hiking, water activities, or wildlife viewing depending on the destination."
      },
      {
        day: "Day 7",
        title: "Leisure & Departure",
        description: "Free time for shopping or relaxation. Check out and transfer to the airport for your departure."
      }
    ];

  return (
    <>
      {/* Hero Section */}
      <div 
        className="relative h-[70vh] min-h-[500px] bg-cover bg-center"
        style={{ backgroundImage: `url(${destination.image})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl text-white">
              <Link to="/destinations">
                <Button variant="link" className="text-white mb-4 p-0 hover:no-underline">
                  <span className="mr-2">←</span> Back to Destinations
                </Button>
              </Link>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-sans">
                {destination.name}
              </h1>
              <div className="flex items-center mb-6">
                <MapPin className="h-5 w-5 text-travel-gold mr-2" />
                <span className="capitalize">{destination.region}</span>
              </div>
              {destination.tags && destination.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {destination.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      className="bg-travel-gold/70 hover:bg-travel-gold text-white"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xl text-gray-200 mb-8 max-w-2xl">
                {destination.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  asChild
                  className="bg-travel-gold hover:bg-amber-600 text-black px-8 py-6 text-lg"
                >
                  <Link to={`/book/${destination.id}`}>Book Now</Link>
                </Button>
                <div className="flex items-center bg-black bg-opacity-50 px-6 py-3 rounded-lg">
                  <span className="text-travel-gold font-semibold text-2xl">
                    {destination.price}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Overview */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6 border-b pb-2 font-sans">Destination Overview</h2>
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p>
                  Discover the enchanting beauty and rich cultural heritage of {destination.name}. 
                  This captivating destination offers a perfect blend of historic landmarks, 
                  breathtaking landscapes, and authentic local experiences.
                </p>
                <p>
                  From exploring ancient ruins and architectural marvels to savoring delicious 
                  regional cuisine and engaging with friendly locals, {destination.name} promises 
                  an unforgettable journey that will leave you with lasting memories.
                </p>
                <p>
                  Our carefully crafted itinerary ensures you experience the very best this 
                  destination has to offer, while still providing flexibility for personal 
                  exploration and relaxation.
                </p>
              </div>
            </section>
            
            {/* Itinerary */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6 border-b pb-2 font-sans">
                {destination.duration_days ? `${destination.duration_days}-Day Itinerary` : 'Sample Itinerary'}
              </h2>
              <div className="space-y-8">
                {itinerary.map((item, index) => (
                  <div key={index} className="relative pl-8 border-l-2 border-travel-gold/30">
                    <div className="absolute top-0 left-[-9px] bg-travel-gold text-white rounded-full w-16 h-16 flex items-center justify-center">
                      {item.day.split('-')[0]}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Note: This is a sample itinerary. Your actual journey may vary based on 
                weather conditions, local events, and customizations.
              </p>
            </section>
          </div>
          
          <div>
            {/* Trip Details Sidebar */}
            <div className="sticky top-24 space-y-6">
              {/* Trip Highlights */}
              <div className="bg-muted rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 font-sans">Trip Highlights</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Calendar className="h-5 w-5 text-travel-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span>{destination.duration_days || 7} days / {(destination.duration_days || 7) - 1} nights</span>
                  </li>
                  <li className="flex items-start">
                    <Users className="h-5 w-5 text-travel-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span>Small group or private tour options</span>
                  </li>
                  <li className="flex items-start">
                    <MapPin className="h-5 w-5 text-travel-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span>Expertly crafted itinerary</span>
                  </li>
                </ul>
              </div>
              
              {/* What's Included */}
              <div className="bg-muted rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 font-sans">What's Included</h3>
                <ul className="space-y-1">
                  {included.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 text-travel-gold mr-2 flex-shrink-0 mt-1" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Not Included */}
              <div className="bg-muted rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 font-sans">Not Included</h3>
                <ul className="space-y-1">
                  {notIncluded.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground pl-6 relative">
                      <span className="absolute left-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Book Now Button */}
              <div className="mt-6">
                <Button 
                  asChild
                  className="w-full bg-travel-gold hover:bg-amber-600 text-black py-6 text-lg"
                >
                  <Link to={`/book/${destination.id}`}>Book This Journey</Link>
                </Button>
                <p className="text-center text-sm mt-2 text-muted-foreground">
                  Starting from {destination.price}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DestinationDetail;
