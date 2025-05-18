import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Calendar } from 'lucide-react';
import { CalendarIcon } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabaseCustom } from '@/utils/supabase-custom';

interface Destination {
  id: number;
  name: string;
  region: string;
  image: string;
  description: string;
  price: string;
  tags: string[];
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email.',
  }),
  phone: z.string().min(10, {
    message: 'Phone number must be at least 10 digits.',
  }),
  travelDate: z.date({
    required_error: 'A date is required.',
  }),
  numTravelers: z.number().min(1, {
    message: 'Number of travelers must be at least 1.',
  }),
  specialRequests: z.string().optional(),
});

const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      travelDate: new Date(),
      numTravelers: 1,
      specialRequests: '',
    },
  });

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        setIsLoading(true);
        
        if (!id) throw new Error("Destination ID is required");
        
        // Fix: Convert string id to number for Supabase query
        const destinationId = parseInt(id, 10);
        if (isNaN(destinationId)) {
          throw new Error("Invalid destination ID");
        }
        
        const { data, error } = await supabaseCustom
          .from('destinations')
          .select('*')
          .eq('id', destinationId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setDestination(data as Destination);
        } else {
          throw new Error("Destination not found");
        }
      } catch (error: any) {
        console.error('Error fetching destination:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load destination details.',
          variant: 'destructive',
        });
        navigate('/destinations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDestination();
  }, [id, navigate, toast]);
  
  const handleBookingSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      if (!user) throw new Error("You must be logged in to book a trip");
      if (!destination) throw new Error("Destination not found");
      
      // Format the date as ISO string for Supabase
      const formattedDate = values.travelDate ? format(values.travelDate, 'yyyy-MM-dd') : '';
      
      // Calculate price based on number of travelers
      const totalPrice = destination.price ? parseInt(destination.price.replace(/[^\d]/g, '')) * values.numTravelers : 0;
      
      const bookingData = {
        user_id: user.id,
        destination_id: destination.id,
        destination_name: destination.name,
        travel_date: formattedDate,
        num_travelers: values.numTravelers,
        price: totalPrice,
        traveler_name: values.name,
        traveler_email: values.email,
        traveler_phone: values.phone,
        special_requests: values.specialRequests || null,
        status: 'pending'
      };
      
      const { error } = await supabaseCustom
        .from('bookings')
        .insert(bookingData);
        
      if (error) throw error;
      
      toast({
        title: 'Booking successful!',
        description: `Your trip to ${destination.name} has been booked.`,
      });
      
      // Redirect to booking success page
      navigate('/booking-success', { 
        state: { 
          destinationName: destination.name, 
          travelDate: formattedDate,
          numTravelers: values.numTravelers
        } 
      });
      
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking failed',
        description: error.message || 'There was an error processing your booking.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card>
          <CardContent className="p-4">
            <CardTitle className="text-lg font-semibold">Destination Not Found</CardTitle>
            <CardDescription>
              The destination you are looking for does not exist.
            </CardDescription>
            <CardFooter>
              <Button onClick={() => navigate('/destinations')}>
                Back to Destinations
              </Button>
            </CardFooter>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Book Your Trip to {destination.name}</CardTitle>
          <CardDescription>
            Fill out the form below to book your travel.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleBookingSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Your Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Your Phone Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="travelDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Travel Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-[240px] pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="numTravelers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Travelers</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Number of Travelers"
                        defaultValue="1"
                        min="1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="specialRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requests (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special requests?"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Book Now'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingPage;
