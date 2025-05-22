
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Bookmark, Calendar, MapPin, Loader2, Filter } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withAnimation } from "@/utils/animation-utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock trip data - in a real app, you'd fetch this from your backend
const mockTrips = [
  {
    id: "1",
    destination_name: "Bali Paradise Resort",
    destination_image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    trip_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "upcoming",
    location: "Denpasar, Indonesia",
    price: 1299,
    booking_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "2",
    destination_name: "Kyoto Cultural Tour",
    destination_image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    trip_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    status: "upcoming",
    location: "Kyoto, Japan",
    price: 1899,
    booking_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "3",
    destination_name: "Rome Historical Experience",
    destination_image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1096&q=80",
    trip_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    location: "Rome, Italy",
    price: 1599,
    booking_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  }
];

type Trip = typeof mockTrips[0];

const MyTrips = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-asc");
  
  useEffect(() => {
    // In a real app, you'd fetch the user's trips from your backend
    const fetchTrips = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTrips(mockTrips);
      } catch (error) {
        console.error("Failed to fetch trips:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchTrips();
    }
  }, [user]);
  
  // Filter and sort trips
  const filteredTrips = trips.filter(trip => {
    if (filter === "all") return true;
    return trip.status === filter;
  });
  
  const sortedTrips = [...filteredTrips].sort((a, b) => {
    if (sortBy === "date-asc") {
      return new Date(a.trip_date).getTime() - new Date(b.trip_date).getTime();
    }
    if (sortBy === "date-desc") {
      return new Date(b.trip_date).getTime() - new Date(a.trip_date).getTime();
    }
    if (sortBy === "price-asc") {
      return a.price - b.price;
    }
    if (sortBy === "price-desc") {
      return b.price - a.price;
    }
    return 0;
  });
  
  if (!user) {
    return (
      <div className="container mx-auto py-32 px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">My Trips</h1>
          <p className="mb-6">Please log in to view your trips.</p>
          <Button asChild className="bg-travel-gold hover:bg-amber-600 text-black">
            <a href="/auth">Log In</a>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Trips</h1>
            <p className="text-muted-foreground">View and manage your travel adventures</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trips</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-asc">Date (Earliest)</SelectItem>
                <SelectItem value="date-desc">Date (Latest)</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-travel-gold" />
          </div>
        ) : sortedTrips.length === 0 ? (
          <Card className="text-center py-16 bg-muted/30">
            <CardContent>
              <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">No trips found</h2>
              <p className="text-muted-foreground mb-6">
                {filter !== "all" 
                  ? `You don't have any ${filter} trips.` 
                  : "You haven't booked any trips yet."}
              </p>
              <Button asChild className="bg-travel-gold hover:bg-amber-600 text-black">
                <a href="/destinations">Explore Destinations</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTrips.map((trip, index) => (
              <Card 
                key={trip.id} 
                className={withAnimation("overflow-hidden group", "hover-lift")}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={trip.destination_image}
                    alt={trip.destination_name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge 
                      className={trip.status === "upcoming" 
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-blue-500 hover:bg-blue-600"
                      }
                    >
                      {trip.status === "upcoming" ? "Upcoming" : "Completed"}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{trip.destination_name}</CardTitle>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    {trip.location}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-travel-gold" />
                    <span>
                      Trip Date: <strong>{format(new Date(trip.trip_date), "MMM d, yyyy")}</strong>
                    </span>
                  </div>
                  <div className="text-sm">
                    Booked {formatDistanceToNow(new Date(trip.booking_date), { addSuffix: true })}
                  </div>
                  <div className="text-travel-gold font-semibold">
                    ${trip.price.toLocaleString()}
                  </div>
                </CardContent>
                
                <CardFooter className="pt-0 flex justify-between">
                  <Button 
                    variant="outline"
                    className="w-full bg-travel-gold/10 border-travel-gold/20 text-travel-gold hover:bg-travel-gold/20"
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTrips;
