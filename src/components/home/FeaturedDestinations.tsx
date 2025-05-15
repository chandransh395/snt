
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const FeaturedDestinations = () => {
  const destinations = [
    {
      id: 1,
      name: "Santorini, Greece",
      image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      description: "Experience the white-washed buildings and stunning sunsets of this iconic Greek island.",
      price: "From $1,299"
    },
    {
      id: 2,
      name: "Bali, Indonesia",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=738&q=80",
      description: "Discover tropical paradise with lush rice terraces, stunning beaches and vibrant culture.",
      price: "From $1,099"
    },
    {
      id: 3,
      name: "Kyoto, Japan",
      image: "https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
      description: "Immerse yourself in the ancient temples, traditional tea houses and serene gardens.",
      price: "From $1,599"
    }
  ];

  return (
    <section className="section-padding bg-muted">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            Featured Destinations
          </h2>
          <div className="w-24 h-1 bg-travel-gold mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our hand-picked selection of the most sought-after travel experiences around the world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map(destination => (
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
                <p className="text-muted-foreground mb-4">{destination.description}</p>
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full border-travel-gold text-travel-gold hover:bg-travel-gold hover:text-white"
                >
                  <Link to={`/destinations/${destination.id}`}>Explore More</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild className="bg-travel-gold hover:bg-amber-600 text-black">
            <Link to="/destinations">View All Destinations</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;
