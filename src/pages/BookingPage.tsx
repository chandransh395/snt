import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, User, MapPin, CreditCard, MessageSquare } from 'lucide-react';
import { formatPrice } from '@/utils/currency';
import { Loader2 } from 'lucide-react';
import { supabaseCustom } from '@/utils/supabase-custom';

type Destination = {
  id: number;
  name: string;
  region: string;
  image: string;
  description: string;
  price: string;
  tags: string[] | null;
};

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [numTravelers, setNumTravelers] = useState<number>(1);
  const [travelDate, setTravelDate] = useState<Date | undefined>();
  const [travelerName, setTravelerName] = useState('');
  const [travelerEmail, setTravelerEmail] = useState('');
  const [travelerPhone, setTravelerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [price, setPrice] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      toast({
        title: 'Error',
        description: 'Destination ID is missing.',
        variant: 'destructive',
      });
      navigate('/destinations');
      return;
    }
    fetchDestination();
  }, [id, navigate]);

  useEffect(() => {
    if (destination) {
      setPrice(calculatePrice(destination, numTravelers));
    }
  }, [numTravelers, destination]);

  const fetchDestination = async () => {
    try {
      setLoading(true);

      const { data: destination, error } = await supabaseCustom
        .from('destinations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setDestination(destination as any);
      setPrice(calculatePrice(destination as any, numTravelers));
    } catch (error) {
      console.error('Error fetching destination:', error);
      toast({
        title: 'Error',
        description: 'Failed to load destination details.',
        variant: 'destructive',
      });
      navigate('/destinations');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = (destination: Destination, travelers: number) => {
    const basePrice = parseFloat(destination.price.replace(/[^0-9.]/g, ''));
    return basePrice * travelers;
  };

  const handleBooking = async () => {
    if (!destination || !travelDate || !travelerName || !travelerEmail || !travelerPhone) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setBookingLoading(true);

      const bookingData = {
        user_id: user?.id || 'guest',
        destination_id: destination.id,
        destination_name: destination.name,
        traveler_name: travelerName,
        traveler_email: travelerEmail,
        traveler_phone: travelerPhone,
        travel_date: format(travelDate, 'yyyy-MM-dd'),
        num_travelers: numTravelers,
        special_requests: specialRequests,
        price: price,
        status: 'pending',
      };

      const { error } = await supabaseCustom.from('bookings').insert(bookingData);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Booking request submitted successfully!',
      });
      navigate('/bookings');
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit booking request.',
        variant: 'destructive',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Destination Not Found</h1>
        <p>Sorry, the destination you are looking for could not be found.</p>
        <Button onClick={() => navigate('/destinations')} className="mt-4">
          Back to Destinations
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{destination.name}</CardTitle>
          <CardDescription>Book your trip to {destination.name} today!</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img src={destination.image} alt={destination.name} className="rounded-md mb-4" />
            <h2 className="text-xl font-semibold mb-2">About {destination.name}</h2>
            <p className="text-gray-600">{destination.description}</p>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Price</h3>
              <p className="text-green-600 font-bold text-xl">{formatPrice(calculatePrice(destination, numTravelers))}</p>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="numTravelers">Number of Travelers</Label>
                <Input
                  id="numTravelers"
                  type="number"
                  min="1"
                  value={numTravelers}
                  onChange={(e) => setNumTravelers(parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label>Travel Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !travelDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {travelDate ? format(travelDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={travelDate}
                      onSelect={setTravelDate}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="travelerName">Traveler Name</Label>
                <Input
                  id="travelerName"
                  type="text"
                  placeholder="Enter your name"
                  value={travelerName}
                  onChange={(e) => setTravelerName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="travelerEmail">Traveler Email</Label>
                <Input
                  id="travelerEmail"
                  type="email"
                  placeholder="Enter your email"
                  value={travelerEmail}
                  onChange={(e) => setTravelerEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="travelerPhone">Traveler Phone</Label>
                <Input
                  id="travelerPhone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={travelerPhone}
                  onChange={(e) => setTravelerPhone(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Textarea
                  id="specialRequests"
                  placeholder="Enter any special requests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                />
              </div>
              <Button
                className="w-full bg-travel-gold hover:bg-amber-600 text-black"
                onClick={handleBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Book Now'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingPage;
