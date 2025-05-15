
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useState } from "react";

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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-playfair">
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

const DestinationsList = () => {
  const [filter, setFilter] = useState("all");
  
  const destinations = [
    {
      id: 1,
      name: "Santorini, Greece",
      region: "europe",
      image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      description: "Experience the iconic white-washed buildings and breathtaking sunsets of this magical Greek island.",
      price: "From $1,299",
    },
    {
      id: 2,
      name: "Kyoto, Japan",
      region: "asia",
      image: "https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
      description: "Immerse yourself in ancient temples, traditional tea houses, and serene Japanese gardens.",
      price: "From $1,599",
    },
    {
      id: 3,
      name: "Bali, Indonesia",
      region: "asia",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=738&q=80",
      description: "Discover tropical paradise with lush rice terraces, stunning beaches and vibrant culture.",
      price: "From $1,099",
    },
    {
      id: 4,
      name: "Amalfi Coast, Italy",
      region: "europe",
      image: "https://images.unsplash.com/photo-1612698093608-4cf302fe56fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      description: "Explore the dramatic coastline, picturesque villages, and delicious cuisine of southern Italy.",
      price: "From $1,499",
    },
    {
      id: 5,
      name: "Machu Picchu, Peru",
      region: "americas",
      image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      description: "Discover the ancient Incan citadel set against a backdrop of stunning Andean peaks.",
      price: "From $1,799",
    },
    {
      id: 6,
      name: "Safari, Tanzania",
      region: "africa",
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1468&q=80",
      description: "Witness the Great Migration and encounter Africa's magnificent wildlife in their natural habitat.",
      price: "From $2,499",
    },
    {
      id: 7,
      name: "Sydney, Australia",
      region: "oceania",
      image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      description: "Experience the vibrant city life, iconic Opera House, and beautiful beaches of Australia's gem.",
      price: "From $1,899",
    },
    {
      id: 8,
      name: "Reykjavik, Iceland",
      region: "europe",
      image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
      description: "Explore otherworldly landscapes, from volcanoes and geysers to the magical Northern Lights.",
      price: "From $1,699",
    },
    {
      id: 9,
      name: "Marrakech, Morocco",
      region: "africa",
      image: "https://images.unsplash.com/photo-1539020140153-e8c5317ee702?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
      description: "Get lost in the colorful souks, ornate palaces, and vibrant culture of this ancient imperial city.",
      price: "From $999",
    },
  ];

  const filteredDestinations = filter === "all" 
    ? destinations 
    : destinations.filter(dest => dest.region === filter);

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDestinations.map(destination => (
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
                <Button asChild variant="outline" className="w-full border-travel-gold text-travel-gold hover:bg-travel-gold hover:text-white">
                  <Link to={`/destinations/${destination.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const CustomJourneys = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">
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
