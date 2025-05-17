
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseCustom } from "@/utils/supabase-custom";
import { cn } from "@/lib/utils";

interface Destination {
  id: number;
  name: string;
  region: string;
  image: string;
  description: string;
  price: string;
  tags: string[];
}

const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [specialRequests, setSpecialRequests] = useState("");
  
  // Price calculation
  const [basePrice, setBasePrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
    }
    fetchDestination();
  }, [id, user]);
  
  useEffect(() => {
    if (basePrice > 0 && travelers > 0) {
      setTotalPrice(basePrice * travelers);
    }
  }, [basePrice, travelers]);

  const fetchDestination = async () => {
    try {
      setLoading(true);
      
      if (!id) {
        toast({
          title: "Error",
          description: "Destination ID is missing.",
          variant: "destructive",
        });
        navigate("/destinations");
        return;
      }
      
      const { data, error } = await supabaseCustom
        .from("destinations")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setDestination(data as Destination);
        
        // Parse price string to get base price
        const priceString = data.price;
        const priceMatch = priceString.match(/\$?(\d+(?:,\d+)*(?:\.\d+)?)/);
        
        if (priceMatch && priceMatch[1]) {
          const parsedPrice = parseFloat(priceMatch[1].replace(/,/g, ""));
          setBasePrice(parsedPrice);
        }
      }
    } catch (error) {
      console.error("Error fetching destination:", error);
      toast({
        title: "Error",
        description: "Failed to load destination details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination || !date || !name || !email || !phone || travelers < 1) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const bookingData = {
        destination_id: destination.id,
        destination_name: destination.name,
        traveler_name: name,
        traveler_email: email,
        traveler_phone: phone,
        num_travelers: travelers,
        price: totalPrice,
        travel_date: format(date, "yyyy-MM-dd"),
        special_requests: specialRequests,
        user_id: user?.id,
        status: "pending"
      };
      
      const { data, error } = await supabaseCustom
        .from("bookings")
        .insert([bookingData])
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Booking successful!",
        description: "Your travel booking has been confirmed.",
      });
      
      // Redirect to booking success page
      navigate("/booking-success", { 
        state: { 
          bookingId: data.id,
          destination: destination.name,
          travelDate: format(date, "MMMM d, yyyy"),
          travelers: travelers 
        } 
      });
      
    } catch (error: any) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Booking failed",
        description: error.message || "There was a problem with your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Destination Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The destination you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate("/destinations")}>
          Browse Destinations
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Destination Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <div className="relative h-48 overflow-hidden">
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{destination.name}</CardTitle>
              <CardDescription>{destination.region}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground line-clamp-3">
                {destination.description}
              </p>
              
              <div className="text-lg font-medium">
                Base Price: <span className="text-travel-gold">{destination.price}</span> per person
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span>Base Price</span>
                  <span>${basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Travelers</span>
                  <span>x {travelers}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                  <span>Total</span>
                  <span className="text-travel-gold">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Book Your Trip</CardTitle>
              <CardDescription>
                Fill in your details to book your trip to {destination.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitBooking} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Your contact number"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="travelers">Number of Travelers</Label>
                    <Input
                      id="travelers"
                      type="number"
                      min={1}
                      value={travelers}
                      onChange={(e) => setTravelers(parseInt(e.target.value))}
                      required
                    />
                  </div>
                  
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
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(date) => 
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label htmlFor="specialRequests">Special Requests (optional)</Label>
                    <Textarea
                      id="specialRequests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Any special requirements or preferences..."
                      rows={4}
                    />
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <Button 
                    type="submit"
                    className="w-full bg-travel-gold hover:bg-amber-600 text-black"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Book Now - $${totalPrice.toFixed(2)}`
                    )}
                  </Button>
                  
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    By booking, you agree to our terms and conditions.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
