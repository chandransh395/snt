
import React from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const Newsletter = () => {
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = form.email.value;
    
    // Here you would typically send this to a backend service
    console.log("Subscribing email:", email);
    
    toast({
      title: "Successfully subscribed!",
      description: "Thank you for subscribing to our newsletter.",
    });
    
    form.reset();
  };

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
          <form className="flex flex-col sm:flex-row gap-4" onSubmit={handleSubscribe}>
            <input 
              type="email" 
              name="email"
              placeholder="Your email address" 
              className="flex-grow px-4 py-3 rounded-md border border-input bg-background" 
              required 
            />
            <Button type="submit" className="bg-travel-gold hover:bg-amber-600 text-black">
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

export default Newsletter;
