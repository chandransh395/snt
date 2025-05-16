
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Tag } from 'lucide-react';

const DestinationHero = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1531572753322-ad063cecc140?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1476&q=80)",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-sans">
            Explore Our <span className="text-travel-gold">Destinations</span>
          </h1>
          <div className="w-24 h-1 bg-travel-gold mx-auto mb-6"></div>
          <p className="text-xl text-gray-200 mb-8">
            Discover handcrafted journeys to the world's most fascinating destinations, from iconic landmarks to hidden treasures.
          </p>
        </div>
      </div>
    </section>
  );
};

type Destination = {
  id: number;
  name: string;
  region: string;
  image: string;
  description: string;
  price: string;
  tags: string[] | null;
};

const DestinationsList = () => {
  const [filter, setFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  useEffect(() => {
    fetchDestinations();
  }, []);
  
  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      setDestinations(data || []);
      
      // Extract all unique tags from destinations
      const allTags = data?.flatMap(dest => dest.tags || []) || [];
      const uniqueTags = [...new Set(allTags)].sort();
      setAvailableTags(uniqueTags);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDestinations = destinations.filter(dest => {
    // First filter by region
    const regionMatches = filter === "all" || dest.region === filter;
    
    // Then filter by tag if a tag filter is active
    const tagMatches = !tagFilter || (dest.tags && dest.tags.includes(tagFilter));
    
    return regionMatches && tagMatches;
  });
  
  const handleTagClick = (tag: string) => {
    setTagFilter(tagFilter === tag ? null : tag);
  };

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        {/* Tag filters */}
        {availableTags.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-5 w-5 text-travel-gold" />
              <h3 className="text-lg font-medium">Filter by Tags:</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <Badge
                  key={tag}
                  variant={tagFilter === tag ? "default" : "outline"}
                  className={`cursor-pointer ${tagFilter === tag ? "bg-travel-gold text-black hover:bg-amber-600" : "hover:bg-muted"}`}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                  {tagFilter === tag && " ✓"}
                </Badge>
              ))}
              {tagFilter && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setTagFilter(null)}
                  className="text-sm"
                >
                  Clear filter
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Region filters */}
        <div className="flex flex-wrap justify-center mb-12 gap-4">
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
            className={filter === "all" ? "bg-travel-gold hover:bg-amber-600 text-black" : ""}
          >
            All Destinations
          </Button>
          <Button
            onClick={() => setFilter("europe")}
            variant={filter === "europe" ? "default" : "outline"}
            className={filter === "europe" ? "bg-travel-gold hover:bg-amber-600 text-black" : ""}
          >
            Europe
          </Button>
          <Button
            onClick={() => setFilter("asia")}
            variant={filter === "asia" ? "default" : "outline"}
            className={filter === "asia" ? "bg-travel-gold hover:bg-amber-600 text-black" : ""}
          >
            Asia
          </Button>
          <Button
            onClick={() => setFilter("americas")}
            variant={filter === "americas" ? "default" : "outline"}
            className={filter === "americas" ? "bg-travel-gold hover:bg-amber-600 text-black" : ""}
          >
            The Americas
          </Button>
          <Button
            onClick={() => setFilter("africa")}
            variant={filter === "africa" ? "default" : "outline"}
            className={filter === "africa" ? "bg-travel-gold hover:bg-amber-600 text-black" : ""}
          >
            Africa
          </Button>
          <Button
            onClick={() => setFilter("oceania")}
            variant={filter === "oceania" ? "default" : "outline"}
            className={filter === "oceania" ? "bg-travel-gold hover:bg-amber-600 text-black" : ""}
          >
            Oceania
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-lg text-muted-foreground">No destinations found matching your filters.</p>
                <Button 
                  onClick={() => {
                    setFilter("all");
                    setTagFilter(null);
                  }}
                  variant="link" 
                  className="mt-2"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              filteredDestinations.map(destination => (
                <Card key={destination.id} className="overflow-hidden border-none shadow-lg group">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="object-cover w-full h-full transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-semibold mb-1">{destination.name}</h3>
                      <p className="text-sm font-medium text-travel-gold">
                        {destination.price}
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    {destination.tags && destination.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {destination.tags.map((tag, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-muted-foreground mb-4">{destination.description}</p>
                    
                    <div className="flex gap-2">
                      <Button asChild variant="outline" className="flex-1 border-travel-gold text-travel-gold hover:bg-travel-gold hover:text-white">
                        <Link to={`/destinations/${destination.id}`}>View Details</Link>
                      </Button>
                      <Button asChild className="flex-1 bg-travel-gold hover:bg-amber-600 text-black">
                        <Link to={`/book/${destination.id}`}>Book Now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};

const CustomJourneys = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-sans">
            Custom <span className="text-travel-gold">Journeys</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Don't see your dream destination? Our travel experts can design a personalized journey tailored to your specific interests, preferences, and travel style.
          </p>
          <Button asChild className="bg-travel-gold hover:bg-amber-600 text-black">
            <Link to="/contact">Inquire About Custom Journeys</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

const Destinations = () => {
  return (
    <>
      <DestinationHero />
      <DestinationsList />
      <CustomJourneys />
    </>
  );
};

export default Destinations;
