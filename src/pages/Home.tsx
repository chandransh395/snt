
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1499678329028-101435549a4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)",
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
              <Link to="/contact">Plan Your Journey</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturedDestinations = () => {
  const destinations = [
    {
      id: 1,
      name: "Santorini, Greece",
      image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      description: "Experience the white-washed buildings and stunning sunsets of this iconic Greek island.",
      price: "From $1,299",
    },
    {
      id: 2,
      name: "Bali, Indonesia",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=738&q=80",
      description: "Discover tropical paradise with lush rice terraces, stunning beaches and vibrant culture.",
      price: "From $1,099",
    },
    {
      id: 3,
      name: "Kyoto, Japan",
      image: "https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
      description: "Immerse yourself in the ancient temples, traditional tea houses and serene gardens.",
      price: "From $1,599",
    },
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
          {destinations.map((destination) => (
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

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-travel-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Personalized Service",
      description: "We tailor each journey to your preferences, ensuring a unique and personalized travel experience.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-travel-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Best Value",
      description: "We negotiate the best rates with our global partners to provide excellent value without compromising quality.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-travel-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Expert Knowledge",
      description: "Our travel consultants have firsthand experience and in-depth knowledge of our destinations.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-travel-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      title: "24/7 Support",
      description: "Travel with peace of mind knowing our support team is available around the clock during your journey.",
    },
  ];

  return (
    <section className="section-padding bg-white dark:bg-secondary">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            Why Choose <span className="text-travel-gold">JourneyGlow</span>
          </h2>
          <div className="w-24 h-1 bg-travel-gold mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Creating exceptional travel experiences is what sets us apart. Discover the JourneyGlow difference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="text-center p-6 bg-background rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 inline-flex items-center justify-center">{reason.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{reason.title}</h3>
              <p className="text-muted-foreground">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      content: "Our family trip to Japan was flawlessly organized. Every detail was taken care of, allowing us to fully immerse ourselves in the culture and create memories that will last a lifetime.",
      author: "Sarah & James Thompson",
      location: "Italy Expedition",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      content: "JourneyGlow created the perfect honeymoon experience for us in Bali. The private villa, exclusive tours, and romantic surprises exceeded all our expectations.",
      author: "Michael & Emma Davis",
      location: "Bali Retreat",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      content: "As a solo traveler, I was amazed by the attention to detail and the unique experiences arranged for my South American adventure. I felt supported throughout while still having the freedom to explore.",
      author: "Lisa Chen",
      location: "Peru Explorer",
      avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    },
  ];

  return (
    <section className="section-padding" style={{ 
      backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1121&q=80)", 
      backgroundSize: "cover", 
      backgroundPosition: "center" 
    }}>
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair text-white">
            Traveler Testimonials
          </h2>
          <div className="w-24 h-1 bg-travel-gold mx-auto mb-6"></div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Hear what our clients have to say about their experiences traveling with JourneyGlow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-lg border-none text-white">
              <CardContent className="p-8">
                <svg className="h-8 w-8 text-travel-gold mb-4" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M10 8v12H6a2 2 0 01-2-2v-2a2 2 0 012-2h2v-6H6a6 6 0 00-6 6v2a6 6 0 006 6h4a2 2 0 002-2V8h-2zM28 8v12h-4a2 2 0 01-2-2v-2a2 2 0 012-2h2v-6h-2a6 6 0 00-6 6v2a6 6 0 006 6h4a2 2 0 002-2V8h-2z" />
                </svg>
                <p className="mb-6 italic">{testimonial.content}</p>
                <div className="flex items-center">
                  <img src={testimonial.avatar} alt={testimonial.author} className="h-12 w-12 rounded-full mr-4" />
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-travel-gold text-sm">{testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const Newsletter = () => {
  return (
    <section className="section-padding bg-muted">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our community and receive travel inspiration, exclusive offers, and expert insights directly to your inbox.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <form className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-md border border-input bg-background"
              required
            />
            <Button className="bg-travel-gold hover:bg-amber-600 text-black">
              Subscribe
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  return (
    <>
      <HeroSection />
      <FeaturedDestinations />
      <WhyChooseUs />
      <Testimonials />
      <Newsletter />
    </>
  );
};

export default Home;
