
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const Testimonials = () => {
  const testimonials = [
    {
      content: "Our family trip to Japan was flawlessly organized. Every detail was taken care of, allowing us to fully immerse ourselves in the culture and create memories that will last a lifetime.",
      author: "Sarah & James Thompson",
      location: "Italy Expedition",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg"
    },
    {
      content: "Seeta Narayan Travels created the perfect honeymoon experience for us in Bali. The private villa, exclusive tours, and romantic surprises exceeded all our expectations.",
      author: "Michael & Emma Davis",
      location: "Bali Retreat",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      content: "As a solo traveler, I was amazed by the attention to detail and the unique experiences arranged for my South American adventure. I felt supported throughout while still having the freedom to explore.",
      author: "Lisa Chen",
      location: "Peru Explorer",
      avatar: "https://randomuser.me/api/portraits/women/42.jpg"
    }
  ];

  return (
    <section 
      className="section-padding" 
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1121&q=80)",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair text-white">
            Traveler Testimonials
          </h2>
          <div className="w-24 h-1 bg-travel-gold mx-auto mb-6"></div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Hear what our clients have to say about their experiences traveling with Seeta Narayan Travels.
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

export default Testimonials;
