
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar } from 'lucide-react';
import { DatePicker } from '@/components/DatePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/utils/currency';
import BookingAuthWrapper from '@/components/BookingAuthWrapper';
import { sendBookingNotification } from '@/utils/notifications';

// Schema for form validation
const bookingSchema = z.object({
  travelerName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  travelerEmail: z.string().email({ message: "Please enter a valid email" }),
  travelerPhone: z.string().min(5, { message: "Please enter a valid phone number" }),
  travelDate: z.date({ required_error: "Please select a travel date" }),
  numTravelers: z.number().min(1).max(20),
  specialRequests: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [destination, setDestination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [duration, setDuration] = useState(1); // Default 1 day
  const [totalPrice, setTotalPrice] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [pricePerPerson, setPricePerPerson] = useState(0);
  const [numTravelers, setNumTravelers] = useState(1);
  
  // Set up React Hook Form with zod validation
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      travelerName: user?.user_metadata?.full_name || '',
      travelerEmail: user?.email || '',
      travelerPhone: '',
      numTravelers: 1,
      specialRequests: '',
      travelDate: undefined,
    },
  });
  
  // Watch for changes to number of travelers
  const watchedNumTravelers = form.watch('numTravelers');
  
  useEffect(() => {
    setNumTravelers(watchedNumTravelers || 1);
  }, [watchedNumTravelers]);
  
  // Fetch destination data
  useEffect(() => {
    async function fetchDestination() {
      try {
        const { data, error } = await supabase
          .from('destinations')
          .select('*')
          .eq('id', Number(id))
          .single();
        
        if (error) throw error;
        
        if (data) {
          setDestination(data);
          // Parse the price string to a number (removing "From" prefix if exists)
          const priceString = data.price.replace(/From\s+/i, '').replace(/[^0-9.-]+/g, '');
          const priceValue = parseFloat(priceString);
          setBasePrice(data.price);
          setPricePerPerson(priceValue);
          
          // Calculate the initial total price
          updateTotalPrice(priceValue, numTravelers, duration);
        }
      } catch (err) {
        console.error('Error fetching destination:', err);
        toast({
          title: 'Error',
          description: 'Failed to load destination details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchDestination();
  }, [id, toast]);
  
  // Update price when duration or number of travelers changes
  useEffect(() => {
    updateTotalPrice(pricePerPerson, numTravelers, duration);
  }, [duration, pricePerPerson, numTravelers]);
  
  // Function to calculate and update the total price
  const updateTotalPrice = (basePrice: number, travelers: number, days: number) => {
    const total = basePrice * days * travelers;
    setTotalPrice(formatPrice(total));
  };
  
  const onSubmit = async (data: BookingFormValues) => {
    if (!destination) return;
    
    try {
      setSubmitting(true);
      
      // Calculate final price
      const priceValue = pricePerPerson * data.numTravelers * duration;
      
      // Format date as ISO string for database storage
      const formattedDate = data.travelDate.toISOString();
      
      const bookingData = {
        destination_id: destination.id,
        destination_name: destination.name,
        user_id: user?.id,
        traveler_name: data.travelerName,
        traveler_email: data.travelerEmail,
        traveler_phone: data.travelerPhone,
        travel_date: formattedDate,
        num_travelers: data.numTravelers,
        special_requests: data.specialRequests,
        price: priceValue,
        status: 'pending',
        // Remove duration_days field as it doesn't exist in the database schema
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: insertedData, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select();
      
      if (error) throw error;

      // Get the inserted booking ID
      const bookingId = insertedData?.[0]?.id;
      
      toast({
        title: 'Booking successful!',
        description: 'Your booking has been submitted.',
      });
      
      // Use the rpc function to increment bookings count
      const { error: rpcError } = await supabase
        .rpc('increment_bookings', { destination_id: destination.id });
      
      if (rpcError) {
        console.error('Error incrementing booking count:', rpcError);
      }

      // Send notification if we have a booking ID
      if (bookingId) {
        try {
          await sendBookingNotification(
            bookingId,
            destination.name,
            data.travelerName
          );
        } catch (notifyError) {
          console.error('Error sending notification:', notifyError);
          // Non-critical error, don't prevent booking success
        }
      }
      
      // Redirect to success page
      navigate('/booking-success');
    } catch (err) {
      console.error('Error submitting booking:', err);
      toast({
        title: 'Booking failed',
        description: 'There was an error processing your booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-travel-gold"></div>
        </div>
      </div>
    );
  }
  
  if (!destination) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Destination Not Found</h2>
          <p className="mb-8">The destination you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/destinations')}>Browse Destinations</Button>
        </div>
      </div>
    );
  }
  
  return (
    <BookingAuthWrapper destinationId={Number(id)} destinationName={destination?.name}>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl md:text-4xl font-semibold mb-6">Book Your Trip</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Destination Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
              <div className="h-48 overflow-hidden">
                <img 
                  src={destination?.image} 
                  alt={destination?.name}
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2">{destination?.name}</h2>
                <p className="text-muted-foreground mb-4 capitalize">{destination?.region}</p>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Trip Duration</h3>
                  <div className="flex items-center mb-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setDuration(Math.max(1, duration - 1))}
                      disabled={duration === 1}
                    >
                      -
                    </Button>
                    <span className="mx-4 font-medium">{duration} {duration === 1 ? 'day' : 'days'}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setDuration(duration + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-sm text-muted-foreground">Base price (per person)</span>
                    <p className="font-medium">{basePrice}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Total price</span>
                    <p className="text-xl font-semibold text-travel-gold">{totalPrice}</p>
                    <span className="text-xs text-muted-foreground">
                      For {numTravelers} {numTravelers === 1 ? 'person' : 'people'}, {duration} {duration === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="travelerName">Full Name</Label>
                  <Input 
                    id="travelerName"
                    placeholder="Enter your full name"
                    {...form.register('travelerName')}
                  />
                  {form.formState.errors.travelerName && (
                    <p className="text-red-500 text-sm">{form.formState.errors.travelerName.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="travelerEmail">Email</Label>
                  <Input 
                    id="travelerEmail" 
                    type="email"
                    placeholder="your.email@example.com"
                    {...form.register('travelerEmail')}
                  />
                  {form.formState.errors.travelerEmail && (
                    <p className="text-red-500 text-sm">{form.formState.errors.travelerEmail.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="travelerPhone">Phone Number</Label>
                  <Input 
                    id="travelerPhone" 
                    placeholder="Enter your phone number"
                    {...form.register('travelerPhone')}
                  />
                  {form.formState.errors.travelerPhone && (
                    <p className="text-red-500 text-sm">{form.formState.errors.travelerPhone.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="numTravelers">Number of Travelers</Label>
                  <Input 
                    id="numTravelers" 
                    type="number" 
                    min={1} 
                    max={20}
                    {...form.register('numTravelers', { valueAsNumber: true })}
                    onChange={(e) => {
                      form.setValue('numTravelers', parseInt(e.target.value) || 1, { shouldValidate: true });
                    }}
                  />
                  {form.formState.errors.numTravelers && (
                    <p className="text-red-500 text-sm">{form.formState.errors.numTravelers.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Travel Date</Label>
                <div className="flex flex-col">
                  <DatePicker
                    selected={form.getValues('travelDate')}
                    onChange={(date) => {
                      if (date) {
                        form.setValue('travelDate', date, { shouldValidate: true });
                      }
                    }}
                    minDate={new Date()}
                    className="w-full"
                    showIcon
                    icon={<Calendar className="h-4 w-4" />}
                  />
                  {form.formState.errors.travelDate && (
                    <p className="text-red-500 text-sm">{form.formState.errors.travelDate.message?.toString()}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                <Textarea 
                  id="specialRequests" 
                  placeholder="Add any special requirements or requests..."
                  className="min-h-[100px]"
                  {...form.register('specialRequests')}
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-travel-gold hover:bg-amber-600 text-black"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="mr-2 animate-spin">⟳</span>
                      Processing...
                    </>
                  ) : (
                    'Complete Booking'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </BookingAuthWrapper>
  );
};

export default BookingPage;
