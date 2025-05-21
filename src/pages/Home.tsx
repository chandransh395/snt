
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import HomePage from '@/components/HomePage';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const Home = () => {
  const [expandedTestimonialIndex, setExpandedTestimonialIndex] = useState<number | null>(null);
  
  const testimonials = [
    {
      text: "I recently completed the sacred Do dham yatra to Kedarnath & Badrinath over six days, starting and ending in Haridwar, And I'm happy  to share my experience with cab service we Used. The vehicle provided was well maintained, And the vehicle handled the rough mountain roads comfortably. Also driver was Not just skilled but also very polite And knowledgeable about the route and places.",
      name: "Naveen Rawat",
      image: "https://lh3.googleusercontent.com/a-/ALV-UjVRO3z2kykQvBWpft-nCWZyUekzdd5WAdZqkzof-R58svl7rH6Rvw=w90-h90-p-rp-mo-br100",
      trip: "Do-Dham Yatra, 2025",
    },
    {
      text: "I haven't seen the hospitality done by the staff. The staff was so polite and humorous. All charges are included in the quotation and there were no hidden charges. Trust full service.",
      name: "Rahul Mamgain",
      image: "https://lh3.googleusercontent.com/a-/ALV-UjV8hiGC37BAWDY830H5oWRY13jN_J_TSi-9KyDlFcjNdL_6GrLR=w45-h45-p-rp-mo-br100",
      trip: "Feb 2025",
    },
    {
      text: "My family and me enjoyed the trip of badrinath... REASONABLE PRICE AND GOOD SERVICE.. The vehicle was clean nd cool but the best part is our driver is also a tourist guide who was very helpful Courteous, cheerful never showed any sign of tiredness or irritability and went way beyond all expectations to show us everything he possibly could... If you book through the seeta narayana travel you will surely had great experience and get travel service at best price...",
      name: "Anjali Negi",
      image: "https://lh3.googleusercontent.com/a-/ALV-UjXVx2iSaCyndNvb-LNxiz2pi2uYY_XpoqX8dMkfWeDozUcSnJfvPg=w45-h45-p-rp-mo-br100",
      trip: "Badrinath, 2024",
    },
  ];

  const toggleExpandTestimonial = (index: number) => {
    if (expandedTestimonialIndex === index) {
      setExpandedTestimonialIndex(null);
    } else {
      setExpandedTestimonialIndex(index);
    }
  };

  return (
    <>
      {/* Fullscreen Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Beautiful landscape"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 md:px-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 drop-shadow-lg font-playfair">
            Discover the World's Most Breathtaking Destinations
          </h1>

          <p className="text-xl md:text-2xl text-white mb-12 opacity-90 animate-fade-in delay-100 max-w-3xl mx-auto">
            Your journey begins with us. Experience unforgettable adventures and create memories that last a lifetime.
          </p>

          <div className="space-x-6 delay-200">
            <Button className="bg-travel-gold hover:bg-amber-600 text-black dark:text-white px-10 py-7 text-lg">
              <Link to="/destinations">Explore Destinations</Link>
            </Button>
            <Button variant="outline" className="border-white bg-transparent text-white hover:bg-white/10 dark:border-white px-10 py-7 text-lg">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
          
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Top Booked Destinations Section */}
      <HomePage />

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card text-card-foreground border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-travel-gold/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl mb-3">Expert Guides</h3>
                <p className="text-muted-foreground">Our professional guides ensure an enriching and safe experience throughout your journey.</p>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground border-border shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
              <CardContent className="p-6">
                <div className="bg-travel-gold/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl mb-3">Unbeatable Prices</h3>
                <p className="text-muted-foreground">We offer competitive pricing and valuable packages to ensure maximum value for your money.</p>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground border-border shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
              <CardContent className="p-6">
                <div className="bg-travel-gold/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl mb-3">Carefully Crafted Journeys</h3>
                <p className="text-muted-foreground">Each itinerary is thoroughly researched and refined to provide exceptional experiences.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Travelers Say</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card text-card-foreground border-border shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col">
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  
                  <p className="mb-4 italic">
                    {expandedTestimonialIndex === index 
                      ? testimonial.text 
                      : `${testimonial.text.slice(0, 120)}...`}
                    
                    <button 
                      onClick={() => toggleExpandTestimonial(index)}
                      className="text-amber-600 hover:text-amber-700 font-medium ml-2 inline-flex items-center"
                    >
                      {expandedTestimonialIndex === index ? "Read less" : "Read more"} 
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </button>
                  </p>
                  
                  <div className="flex items-center mt-auto pt-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                      <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" /> 
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.trip}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Adventure?</h2>
          <p className="mb-8 max-w-2xl mx-auto">Join thousands of satisfied travelers who have explored the world with us. Your perfect journey is just a click away.</p>
          <Button size="lg" className="bg-travel-gold hover:bg-amber-600 text-black dark:text-white px-8">
            <Link to="/destinations">Book Your Trip Now</Link>
          </Button>
        </div>
      </section>
 </>
 );
};

export default Home;
