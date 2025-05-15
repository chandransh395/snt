
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative h-screen overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{
          backgroundImage: "url(https://images.unsplash.com/photo-1499678329028-101435549a4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      <div className="container mx-auto px-4 h-full flex items-center relative z-10">
        <div className="max-w-3xl animate-slide-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-playfair">
            Discover the World's <span className="text-travel-gold">Hidden Treasures</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8">
            Explore curated luxury travel experiences designed to create unforgettable memories.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild className="bg-travel-gold hover:bg-amber-600 text-black">
              <Link to="/destinations">Explore Destinations</Link>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white/20">
              <Link to="/contact" className="text is not visible in light theme">Plan Your Journey</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
