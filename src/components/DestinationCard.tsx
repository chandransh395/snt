import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from '@/utils/currency';

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
}

const DestinationCard: React.FC<DestinationCardProps> = ({ destination }) => {
  return (
    <Link
      key={destination.id}
      to={`/destinations/${destination.id}`}
      className="block hover:no-underline"
    >
      <Card className="overflow-hidden h-full hover-lift transition-all duration-300 hover:shadow-md">
        <div className="relative h-48 overflow-hidden">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          {destination.top_booked && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-amber-500 text-white">Popular</Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="text-xl font-semibold mb-2">{destination.name}</h3>

          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground capitalize">{destination.region}</span>
            <span className="text-sm font-medium">{formatPrice(destination.price)}</span>
          </div>

          <p className="text-sm line-clamp-3 mb-4">
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
    </Link>
  );
};

export default DestinationCard;