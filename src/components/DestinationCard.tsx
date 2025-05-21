
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Star, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Destination {
  id: number;
  name: string;
  region: string;
  image: string;
  description: string;
  price: string;
  tags: string[] | null;
  top_booked?: boolean;
  bookings_count?: number | null;
}

interface DestinationCardProps {
  destination: Destination;
  index: number;
}

const DestinationCard = ({ destination, index }: DestinationCardProps) => {
  // Truncate description to a certain length
  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full flex flex-col shadow-md hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-800">
        <div className="relative h-52 overflow-hidden group">
          <img 
            src={destination.image} 
            alt={destination.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
          
          {/* Price badge */}
          <div className="absolute top-4 right-4 bg-white dark:bg-black/80 shadow-md px-3 py-1.5 rounded-full font-semibold text-sm">
            {destination.price}
          </div>
          
          {/* Region indicator */}
          <div className="absolute bottom-4 left-4 flex items-center bg-black/70 text-white px-3 py-1 rounded-full text-xs">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span className="capitalize">{destination.region}</span>
          </div>
          
          {/* Visual overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        <CardContent className="p-5 flex flex-col flex-1">
          <div className="mb-auto">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold hover:text-travel-gold transition-colors line-clamp-2">
                {destination.name}
              </h3>
              
              {/* Rating indicator for top booked only */}
              {destination.top_booked && (
                <div className="flex items-center text-sm text-amber-500">
                  <Star className="fill-amber-500 h-4 w-4" />
                </div>
              )}
            </div>
            
            {/* Tags */}
            {destination.tags && destination.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {destination.tags.slice(0, 3).map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs px-2 py-0 border-travel-gold/30 text-travel-gold">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Description */}
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {truncateDescription(destination.description)}
            </p>
          </div>
          
          {/* Travel info */}
          <div className="flex items-center text-xs text-muted-foreground mb-4 space-x-4">
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1 text-travel-gold" />
              <span>All Year</span>
            </div>
            <div className="flex items-center">
              <Users className="h-3.5 w-3.5 mr-1 text-travel-gold" />
              <span>All Ages</span>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button 
              asChild
              className="bg-travel-gold hover:bg-amber-600 text-black flex-1"
            >
              <Link to={`/book/${destination.id}`}>
                Book Now
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              className="border-travel-gold text-travel-gold hover:bg-travel-gold/10 flex-1"
            >
              <Link to={`/destinations/${destination.id}`}>
                View Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DestinationCard;
