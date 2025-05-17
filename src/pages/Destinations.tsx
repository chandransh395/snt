
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabaseCustom } from "../utils/supabase-custom";

interface Destination {
  id: number;
  name: string;
  region: string;
  image: string;
  description: string;
  price: string;
  tags: string[];
}

const Destinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [regions, setRegions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    filterDestinations();
  }, [searchQuery, selectedRegions, selectedTags, destinations]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      
      // Fetch destinations
      const { data, error } = await supabaseCustom
        .from("destinations")
        .select("*")
        .order("name");
      
      if (error) throw error;
      
      if (data) {
        const destinationsData = data as Destination[];
        setDestinations(destinationsData);
        
        // Extract unique regions
        const uniqueRegions = Array.from(
          new Set(destinationsData.map((dest) => dest.region))
        ).sort();
        setRegions(uniqueRegions);
        
        // Extract unique tags
        const allTags = destinationsData.flatMap((dest) => dest.tags || []);
        const uniqueTags = Array.from(new Set(allTags)).sort();
        setTags(uniqueTags);
      }
    } catch (error) {
      console.error("Error fetching destinations:", error);
      toast({
        title: "Error",
        description: "Failed to load destinations data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDestinations = () => {
    let filtered = [...destinations];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (dest) =>
          dest.name.toLowerCase().includes(query) ||
          dest.region.toLowerCase().includes(query) ||
          dest.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by selected regions
    if (selectedRegions.length > 0) {
      filtered = filtered.filter((dest) => selectedRegions.includes(dest.region));
    }
    
    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((dest) => 
        dest.tags && selectedTags.some(tag => dest.tags.includes(tag))
      );
    }
    
    setFilteredDestinations(filtered);
  };

  const handleRegionToggle = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedRegions([]);
    setSelectedTags([]);
  };

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 font-playfair">Explore Our Destinations</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover incredible locations around the world, each offering unique experiences and unforgettable memories.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search destinations..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedRegions.length > 0 || selectedTags.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-3.5 w-3.5" /> Clear Filters
            </Button>
          ) : null}
          
          <span className="text-sm text-muted-foreground mr-2">Regions:</span>
          {regions.map((region) => (
            <Badge
              key={region}
              variant={selectedRegions.includes(region) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleRegionToggle(region)}
            >
              {region}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-sm text-muted-foreground mr-2">Tags:</span>
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "secondary" : "outline"}
              className="cursor-pointer"
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredDestinations.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No Destinations Found</h2>
          <p className="text-muted-foreground mb-8">
            Try adjusting your search or filter criteria.
          </p>
          <Button onClick={clearFilters}>Clear All Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDestinations.map((destination) => (
            <Card key={destination.id} className="overflow-hidden group">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="text-xl font-semibold text-white">{destination.name}</h3>
                  <p className="text-sm text-gray-200">{destination.region}</p>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {destination.description}
                </p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-travel-gold">{destination.price}</span>
                  
                  {destination.tags && destination.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {destination.tags.slice(0, 2).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {destination.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{destination.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Button asChild variant="outline" className="flex-1 border-travel-gold text-travel-gold hover:bg-travel-gold hover:text-white">
                    <Link to={`/destinations/${destination.id}`}>Details</Link>
                  </Button>
                  <Button asChild className="flex-1 bg-travel-gold hover:bg-amber-600 text-black">
                    <Link to={`/book/${destination.id}`}>Book Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Destinations;
