// Only updating the destination fetch to use supabase instead of supabaseCustom
// and fix the number/string error we were having
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle, 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/utils/currency';
import { DatePicker } from '@/components/DatePicker';

const BookingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get the duration from location state if available
  const passedDuration = location.state?.duration || 3;
  const passedDurationType = location.state?.durationType || 'days';
  
  const [destination, setDestination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    travelerName: '',
    travelerEmail: '',
    travelerPhone: '',
    numTravelers: 1,
    travelDate: null,
    specialRequests: '',
  });

  useEffect(() => {
    if (id) {
      fetchDestination();
    }
    
    // Pre-fill email from authenticated user
    if (user) {
      setFormData(prev => ({
        ...prev,
        travelerEmail: user.email || '',
      }));
    }
  }, [id, user]);

  const fetchDestination = async () => {
    try {
      setLoading(true);
      
      // Convert ID to number for database query
      const destinationId = parseInt(id as string, 10);
      
      // Validate ID is a number
      if (isNaN(destinationId)) {
        toast({
          title: "Error",
          description: "Invalid destination ID",
          variant: "destructive",
        });
        navigate('/destinations');
        return;
      }
      
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('id', destinationId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setDestination(data);
      } else {
        toast({
          title: "Error",
          description: "Destination not found",
          variant: "destructive",
        });
        navigate('/destinations');
      }
    } catch (error) {
      console.error("Error fetching destination:", error);
      toast({
        title: "Error",
        description: "Failed to load destination details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      travelDate: date,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete your booking.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    try {
      // Validate form data
      if (!formData.travelerName || !formData.travelerEmail || !formData.travelerPhone || !formData.numTravelers || !formData.travelDate) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
      
      // Convert numTravelers to a number
      const numTravelers = parseInt(String(formData.numTravelers), 10);
      
      // Validate numTravelers is a number
      if (isNaN(numTravelers) || numTravelers <= 0) {
        toast({
          title: "Error",
          description: "Number of travelers must be a valid number.",
          variant: "destructive",
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          destination_id: parseInt(id as string, 10),
          destination_name: destination.name,
          traveler_name: formData.travelerName,
          traveler_email: formData.travelerEmail,
          traveler_phone: formData.travelerPhone,
          num_travelers: numTravelers,
          travel_date: formData.travelDate.toISOString(),
          special_requests: formData.specialRequests,
          price: calculateTotalPrice(),
          status: 'pending',
          created_at: new Date().toISOString(),
          duration: passedDuration,
          duration_type: passedDurationType,
        });
        
      if (error) throw error;
      
      toast({
        title: "Booking Request Sent",
        description: "Your booking request has been submitted and is awaiting confirmation.",
      });
      
      // Redirect to a confirmation page or back to destinations
      navigate('/destinations');
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Error",
        description: "Failed to submit booking. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Calculate total price based on base price and duration
  const calculateTotalPrice = () => {
    if (!destination) return "0";
    
    // Extract numeric price from the destination price string (e.g. "From ₹25,000" → 25000)
    const priceMatch = destination.price.match(/[\d,]+/);
    if (!priceMatch) return destination.price;
    
    const basePrice = parseFloat(priceMatch[0].replace(/,/g, ''));
    const nightsMultiplier = passedDurationType === 'nights' ? passedDuration : (passedDuration - 1);
    const multiplier = passedDurationType === 'weeks' ? passedDuration * 7 : nightsMultiplier;
    
    // For multi-day trips, apply the multiplier and add a base package fee
    const calculatedPrice = basePrice + (basePrice * 0.8 * multiplier);
    
    return `₹${calculatedPrice.toLocaleString()}`;
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p>Loading destination details...</p>
      </div>
    );
  }
  
  if (!destination) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Destination Not Found</h2>
        <Button onClick={() => navigate('/destinations')}>View All Destinations</Button>
      </div>
    );
  }
  
  // Update the booking details section to display duration
  
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">{destination.name}</h1>
      <div className="text-muted-foreground mb-8">Book your adventure to this amazing destination</div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Traveler Information</CardTitle>
              <CardDescription>
                Enter your details to complete your booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="travelerName">Full Name</Label>
                  <Input
                    type="text"
                    id="travelerName"
                    name="travelerName"
                    value={formData.travelerName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="travelerEmail">Email Address</Label>
                  <Input
                    type="email"
                    id="travelerEmail"
                    name="travelerEmail"
                    value={formData.travelerEmail}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="travelerPhone">Phone Number</Label>
                  <Input
                    type="tel"
                    id="travelerPhone"
                    name="travelerPhone"
                    value={formData.travelerPhone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="numTravelers">Number of Travelers</Label>
                  <Input
                    type="number"
                    id="numTravelers"
                    name="numTravelers"
                    value={formData.numTravelers}
                    onChange={handleInputChange}
                    placeholder="1"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="travelDate" className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Select Travel Date
                  </Label>
                  <DatePicker 
                    id="travelDate"
                    name="travelDate"
                    selected={formData.travelDate}
                    onChange={handleDateChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    placeholder="Enter any special requests (optional)"
                    rows={3}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle>Booking Summary</CardTitle>
              <CardDescription>
                Trip details and pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative h-40 rounded-md overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-3">
                      <h3 className="text-white font-semibold">{destination.name}</h3>
                      <p className="text-white/90 text-sm">{destination.region}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Trip Duration:</h4>
                  <Badge variant="outline" className="bg-muted/50">
                    {passedDuration} {passedDurationType}
                  </Badge>
                </div>
                
                {destination.tags && destination.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Experience:</h4>
                    <div className="flex flex-wrap gap-1">
                      {destination.tags.map((tag: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Base price:</span>
                    <span className="font-medium">{destination.price}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Duration:</span>
                    <span className="font-medium">{passedDuration} {passedDurationType}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="text-xl font-bold text-travel-gold">
                    {calculateTotalPrice()}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                form="booking-form"
                className="w-full bg-travel-gold hover:bg-amber-600 text-black"
              >
                Confirm Booking
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
