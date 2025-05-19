
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import HomePage from '@/components/HomePage';

const Home = () => {
  return (
    <>
 {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Beautiful landscape"
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 md:px-8 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-slide-up">
            Discover the World's Most Breathtaking Destinations
          </h1>

          <p className="text-lg md:text-xl text-white mb-8 opacity-90 animate-slide-up delay-100">
            Your journey begins with us. Experience unforgettable adventures and create memories that last a lifetime.
          </p>

          <div className="space-x-4 animate-slide-up delay-200">
            <Button asChild className="bg-travel-gold hover:bg-amber-600 text-black dark:text-white px-8 py-6">
              <Link to="/destinations">Explore Destinations</Link>
            </Button>
            <Button asChild variant="outline" className="border-white bg-white text-black hover:bg-black hover:text-white dark:border-black dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black px-8 py-6">
              <Link to="/contact">Contact Us</Link>
            </Button>
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
            <Card className="bg-card text-card-foreground border-border shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mb-4 italic">"I recently completed the sacred Do dham yatra to Kedarnath & Badrinath over six days, starting and ending in Haridwar, And I'm happy  to share my experience with cab service we Used. The vehicle provided was well maintained, And the vehicle handled the rough mountain roads comfortably. Also driver was Not just skilled but also very polite And knowledgeable about the route and places."</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"><img src="https://lh3.googleusercontent.com/a-/ALV-UjVRO3z2kykQvBWpft-nCWZyUekzdd5WAdZqkzof-R58svl7rH6Rvw=w90-h90-p-rp-mo-br100" alt="" /></div>
                  <div>
                    <p className="font-semibold">Naveen Rawat</p>
                    <p className="text-sm text-muted-foreground">Do-Dham Yatra, 2025</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground border-border shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mb-4 italic">"I haven't seen the hospitality done by the staff. The staff was so polite and humorous. All charges are included in the quotation and there were no hidden charges. Trust full service."</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"><img src="https://lh3.googleusercontent.com/a-/ALV-UjV8hiGC37BAWDY830H5oWRY13jN_J_TSi-9KyDlFcjNdL_6GrLR=w45-h45-p-rp-mo-br100" alt="" /></div>
                  <div>
                    <p className="font-semibold">Rahul Mamgain</p>
                    <p className="text-sm text-muted-foreground">Feb 2025</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground border-border shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="relative w-full rounded-lg p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground text-foreground mb-4">"My family and me enjoyed the trip of badrinath... REASONABLE PRICE AND GOOD SERVICE..
The vehicle was clean nd cool but the best part is our driver is also a tourist guide who was very helpful
Courteous, cheerful never showed any sign of tiredness or irritability and went way beyond all expectations to show us everything he possibly could...
If you book through the seeta narayana travel you will surely had great experience and get travel service at best price..."</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"> <img src="https://lh3.googleusercontent.com/a-/ALV-UjXVx2iSaCyndNvb-LNxiz2pi2uYY_XpoqX8dMkfWeDozUcSnJfvPg=w45-h45-p-rp-mo-br100" alt="" /> </div>
                  <div>
                    <p className="font-semibold">Anjali Negi</p>
                    <p className="text-sm text-muted-foreground">Badrinath, 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Adventure?</h2>
          <p className="mb-8 max-w-2xl mx-auto">Join thousands of satisfied travelers who have explored the world with us. Your perfect journey is just a click away.</p>
          <Button asChild size="lg" className="bg-travel-gold hover:bg-amber-600 text-black dark:text-white px-8">
            <Link to="/destinations">Book Your Trip Now</Link>
          </Button>
        </div>
      </section>
 </>
 );
};

export default Home;
