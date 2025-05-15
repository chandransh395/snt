
import React from 'react';

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-travel-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Personalized Service",
      description: "We tailor each journey to your preferences, ensuring a unique and personalized travel experience."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-travel-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Best Value",
      description: "We negotiate the best rates with our global partners to provide excellent value without compromising quality."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-travel-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Expert Knowledge",
      description: "Our travel consultants have firsthand experience and in-depth knowledge of our destinations."
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-travel-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      title: "24/7 Support",
      description: "Travel with peace of mind knowing our support team is available around the clock during your journey."
    }
  ];
  
  return (
    <section className="section-padding bg-white dark:bg-secondary">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            Why Choose <span className="text-travel-gold">Seeta Narayan Travels</span>
          </h2>
          <div className="w-24 h-1 bg-travel-gold mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Creating exceptional travel experiences is what sets us apart. Discover the Seeta Narayan Travels difference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => (
            <div 
              key={index} 
              className="text-center p-6 bg-background rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
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

export default WhyChooseUs;
