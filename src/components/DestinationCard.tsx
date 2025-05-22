
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

type DestinationCardProps = {
  destination: {
    id: number;
    name: string;
    region: string;
    image?: string;
    description?: string;
    price?: string;
    tags?: string[] | null;
    top_booked?: boolean;
    bookings_count?: number | null;
  };
  index: number;
};

const DestinationCard = ({ destination, index }: DestinationCardProps) => {
  const { id, name, region, image, price, tags, top_booked } = destination;
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Listen for connectivity changes
  useEffect(() => {
    const handleConnectivityChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      setIsOnline(customEvent.detail?.isOnline ?? navigator.onLine);
    };

    document.addEventListener('app-connectivity', handleConnectivityChange);

    // Set initial online status
    setIsOnline(navigator.onLine);

    return () => {
      document.removeEventListener('app-connectivity', handleConnectivityChange);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-all duration-300 bg-card text-card-foreground">
        <div className="relative h-48 overflow-hidden bg-gray-200">
          {image ? (
            <img
              src={image}
              alt={name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
                setImageLoaded(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
          
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-travel-gold rounded-full animate-spin"></div>
            </div>
          )}
          
          {top_booked && (
            <div className="absolute top-2 right-2 bg-travel-gold text-black py-1 px-2 rounded-md flex items-center gap-1 font-medium text-sm shadow-md">
              <TrendingUp className="w-4 h-4" />
              <span>Popular</span>
            </div>
          )}
          
          {price && (
            <div className="absolute bottom-2 right-2 bg-black/70 dark:bg-white/80 text-white dark:text-black py-1 px-2 rounded-sm text-sm font-medium">
              {price}
            </div>
          )}
        </div>
        
        <CardContent className="p-4 flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold truncate">{name}</h3>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">{region}</p>
          
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-0 mt-auto">
          <Link
            to={`/destinations/${id}`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-travel-gold text-black dark:text-black hover:bg-amber-600 dark:hover:bg-amber-500 h-9 px-4 py-2 w-full"
          >
            View Details
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default DestinationCard;
