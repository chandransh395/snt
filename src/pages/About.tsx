
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AboutHero = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1512552288940-3a300922a275?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80)",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-playfair">
            Our <span className="text-travel-gold">Story</span>
          </h1>
          <div className="w-24 h-1 bg-travel-gold mx-auto mb-6"></div>
          <p className="text-xl text-gray-200 mb-8">
            We're passionate about creating extraordinary travel experiences that transform ordinary trips into unforgettable journeys.
          </p>
        </div>
      </div>
    </section>
  );
};

const OurStory = () => {
  return (
    <section className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
              alt="JourneyGlow founders"
              className="rounded-lg shadow-xl"
            />
          </div>
          <div className="animate-slide-up">
            <h2 className="text-3xl font-bold mb-6 font-playfair">The JourneyGlow <span className="text-travel-gold">Beginning</span></h2>
            <p className="text-lg text-muted-foreground mb-6">
              Founded in 2005 by Emma and Daniel Richards, JourneyGlow was born from a shared passion for travel and a vision to create a travel agency that goes beyond booking flights and hotels.
            </p>
            <p className="text-lg text-muted-foreground mb-6">
              After years of exploring over 60 countries across all seven continents, Emma and Daniel realized that the most memorable travel experiences were those that connected them deeply with the local culture, people, and places.
            </p>
            <p className="text-lg text-muted-foreground mb-6">
              They set out to build a team of passionate travel experts who share their philosophy that true luxury isn't about opulence, but about authentic, meaningful experiences tailored to each traveler's unique interests and desires.
            </p>
            <p className="text-lg text-muted-foreground">
              Today, JourneyGlow has grown into a globally recognized travel agency, but our core values remain unchanged: creating personalized journeys that illuminate the world's beauty and transform how our clients experience it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const OurValues = () => {
  const values = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-travel-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      title: "Cultural Immersion",
      description: "We believe in creating experiences that allow travelers to genuinely connect with local cultures, traditions, and communities.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-travel-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
      title: "Responsible Travel",
      description: "We are committed to sustainable tourism practices that respect and preserve the environments and communities we visit.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-travel-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: "Personalized Experiences",
      description: "We recognize that every traveler is unique, and we tailor each journey to reflect individual preferences and interests.",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">Our Core <span className="text-travel-gold">Values</span></h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            At JourneyGlow, our values shape every aspect of the travel experiences we create and the way we operate as a company.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {values.map((value, index) => (
            <div key={index} className="text-center p-6">
              <div className="mb-6 flex justify-center">{value.icon}</div>
              <h3 className="text-2xl font-semibold mb-4">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Team = () => {
  const team = [
    {
      name: "Emma Richards",
      role: "Co-Founder & CEO",
      bio: "With a background in luxury hospitality and over 20 years of travel expertise, Emma leads our vision and strategy.",
      image: "https://randomuser.me/api/portraits/women/23.jpg",
    },
    {
      name: "Daniel Richards",
      role: "Co-Founder & Creative Director",
      bio: "A former travel photographer, Daniel brings his creative eye and passion for discovery to curating unique experiences.",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    {
      name: "Sofia Martinez",
      role: "Head of Destinations",
      bio: "Having lived on four continents, Sofia's extensive knowledge helps us find hidden gems across the globe.",
      image: "https://randomuser.me/api/portraits/women/35.jpg",
    },
    {
      name: "James Wilson",
      role: "Client Experience Manager",
      bio: "James ensures that each client receives personalized attention and that every journey exceeds expectations.",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
  ];

  return (
    <section className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">Meet Our <span className="text-travel-gold">Team</span></h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our passionate team of travel experts brings diverse backgrounds and global experiences to craft your perfect journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-background rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img src={member.image} alt={member.name} className="w-full h-64 object-cover object-center" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-travel-gold mb-4">{member.role}</p>
                <p className="text-muted-foreground">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => {
  return (
    <section className="py-24 bg-secondary text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">Ready to Start Your <span className="text-travel-gold">Journey?</span></h2>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Let us create a tailored travel experience that aligns with your interests, preferences, and dreams.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild className="bg-travel-gold hover:bg-amber-600 text-black">
            <Link to="/contact" className="text-black dark:text-black">Contact Us</Link>
          </Button>
          <Button asChild variant="outline" className="border-white color:black hover:bg-black hover:text-white dark:border-black dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black">
            <Link to="/destinations">Explore Destinations</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <>
      <AboutHero />
      <OurStory />
      <OurValues />
      <Team />
      <CTA />
    </>
  );
};

export default About;
