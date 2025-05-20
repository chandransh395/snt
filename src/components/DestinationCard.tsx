
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from '@/utils/currency';
import { motion } from 'framer-motion';

type Destination = {
  id: number;
  name: string;
  region: string;
  image: string;
  description: string;
  price: string;
  tags: string[] | null;
  top_booked: boolean;
  bookings_count: number | null;
};

interface DestinationCardProps {
  destination: Destination;
  index?: number;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ destination, index = 0 }) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/destinations/${destination.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full"
      onClick={handleCardClick}
    >
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg border-muted/40 cursor-pointer">
        <div className="relative h-52 overflow-hidden">
          <img
            src={destination.image || 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=600&q=60'}
            alt={destination.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
          {destination.top_booked && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-amber-500 text-white font-medium px-3 py-1">Popular</Badge>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
            <h3 className="text-xl font-semibold mb-1">{destination.name}</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm capitalize opacity-90">{destination.region}</span>
              <span className="text-sm font-medium bg-black/30 px-2 py-1 rounded">{formatPrice(destination.price)}</span>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <p className="text-sm line-clamp-3 text-muted-foreground mb-4">
            {destination.description}
          </p>

          <div className="flex flex-wrap gap-1 mt-auto">
            {destination.tags?.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DestinationCard;
