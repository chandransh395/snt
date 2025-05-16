
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { formatPrice } from '@/utils/currency';

interface Destination {
  id: number;
  name: string;
  region: string;
  image: string;
  description: string;
  price: string;
  price_value: number;
}

const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    numTravelers: 1,
    specialRequests: '',
  });
  
  useEffect(() => {
    if (id) {
      fetchDestination(parseInt(id));
    }
    
    // Pre-fill email if user is logged in
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
  }, [id, user]);
  
  const fetchDestination = async (destinationId: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('id', destinationId)
        .single();
        
      if (error) throw error;
      
      // Extract numeric price value from string (e.g., "From ₹1,299" -> 1299)
      let priceValue = 1299; // Default fallback price
      if (data) {
        const priceMatch = data.price.match(/₹([0-9,]+)/);
        if (priceMatch && priceMatch[1]) {
          priceValue = parseInt(priceMatch[1].replace(/,/g, ''), 10);
        }
        
        setDestination({
          ...data,
          price_value: priceValue
        });
      }
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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'numTravelers' ? parseInt(value, 10) : value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!date) {
      toast({
        title: 'Please select a date',
        description: 'You need to select a travel date to proceed.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!destination) return;
    
    try {
      setSubmitting(true);
      
      const totalPrice = destination.price_value * formData.numTravelers;
      
      // Create the booking
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user?.id || null,
          destination_id: destination.id,
          traveler_name: formData.name,
          traveler_email: formData.email,
          traveler_phone: formData.phone,
          travel_date: date.toISOString(),
          num_travelers: formData.numTravelers,
          special_requests: formData.specialRequests || null,
          status: 'pending',
          price: totalPrice
        })
        .select();
        
      if (error) throw error;
      
      toast({
        title: 'Booking Submitted!',
        description: 'Your booking request has been submitted successfully. We will contact you shortly.',
      });
      
      // Redirect to booking confirmation page
      navigate('/booking-success');
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!destination) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Destination Not Found</h2>
        <p className="mb-8">The destination you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/destinations')}>
          Browse All Destinations
        </Button>
      </div>
    );
  }
  
  // Calculate the base price from the string (assuming format is "From ₹X,XXX")
  const calculateTotal = () => {
    return destination.price_value * formData.numTravelers;
  };

  return (
    <div className="container mx-auto py-16 px-4">
      <Button 
        onClick={() => navigate(-1)} 
        variant="outline" 
        className="mb-6"
      >
        Back to Destination
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-6">Book Your Journey to {destination.name}</h1>
          
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Traveler Information</CardTitle>
                <CardDescription>
                  Please provide your contact details so we can process your booking.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
                <CardDescription>
                  Select your preferred travel date and number of travelers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Travel Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="numTravelers">Number of Travelers</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="numTravelers"
                      name="numTravelers"
                      type="number"
                      min="1"
                      max="15"
                      value={formData.numTravelers}
                      onChange={handleInputChange}
                      className="max-w-[100px]"
                      required
                    />
                    <span className="text-muted-foreground">
                      {formData.numTravelers > 1 ? 'travelers' : 'traveler'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                  <Textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    placeholder="Any dietary requirements, accessibility needs, or special occasions?"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-8 flex justify-end">
              <Button 
                type="submit" 
                className="bg-travel-gold hover:bg-amber-600 text-black text-lg py-6 px-8"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : 'Confirm Booking Request'}
              </Button>
            </div>
          </form>
        </div>
        
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Destination:</span>
                  <span>{destination.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Base Price:</span>
                  <span className="font-mono">{destination.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Travelers:</span>
                  <span>x{formData.numTravelers}</span>
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-lg font-bold">{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground mt-4">
                  <p className="font-medium mb-2">Booking Notes:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>A confirmation email will be sent upon approval.</li>
                    <li>Payment details will be provided after booking confirmation.</li>
                    <li>Cancel up to 48 hours before travel date for a full refund.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
