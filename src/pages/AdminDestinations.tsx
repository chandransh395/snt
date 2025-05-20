
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Edit, Plus, Trash2, Calendar } from 'lucide-react';
import { formatPrice } from '@/utils/currency';
import { supabase } from '@/integrations/supabase/client';
import TagsRegionsManager from '@/components/admin/TagsRegionsManager';

type Destination = {
  id: number;
  name: string;
  region: string;
  image: string;
  description: string;
  price: string;
  tags: string[] | null;
  top_booked?: boolean;
  bookings_count?: number;
  duration_days?: number;
  itinerary?: ItineraryDay[];
};

type ItineraryDay = {
  day: string;
  title: string;
  description: string;
};

type Tag = {
  id: number;
  name: string;
};

type Region = {
  id: number;
  name: string;
  value: string;
};

const AdminDestinations = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("destinations");
  const [currentDestination, setCurrentDestination] = useState<Partial<Destination>>({
    name: '',
    region: 'europe',
    image: '',
    description: '',
    price: '',
    tags: [],
    top_booked: false,
    bookings_count: 0,
    duration_days: 7,
    itinerary: []
  });
  const [selectedTag, setSelectedTag] = useState('');

  // Itinerary state
  const [itineraryFormOpen, setItineraryFormOpen] = useState(false);
  const [currentItineraryItem, setCurrentItineraryItem] = useState<ItineraryDay>({
    day: '',
    title: '',
    description: ''
  });
  const [isEditingItinerary, setIsEditingItinerary] = useState(false);
  const [editItineraryIndex, setEditItineraryIndex] = useState<number | null>(null);
  
  // Redirect if not logged in or not an admin
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  useEffect(() => {
    if (activeTab === "destinations") {
      fetchDestinations();
      fetchTags();
      fetchRegions();
    }
  }, [activeTab]);
  
  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('id');
        
      if (error) throw error;
      setDestinations(data as any as Destination[] || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch destinations.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setTags(data as any as Tag[] || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };
  
  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setRegions(data as Region[] || []);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentDestination({
      ...currentDestination,
      [name]: value,
    });
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCurrentDestination({
      ...currentDestination,
      [name]: checked,
    });
  };
  
  const handleSelectChange = (value: string, field: string) => {
    setCurrentDestination({
      ...currentDestination,
      [field]: value,
    });
  };
  
  const handleAddTag = () => {
    if (selectedTag && !currentDestination.tags?.includes(selectedTag)) {
      setCurrentDestination({
        ...currentDestination,
        tags: [...(currentDestination.tags || []), selectedTag],
      });
      setSelectedTag('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setCurrentDestination({
      ...currentDestination,
      tags: currentDestination.tags?.filter(t => t !== tag),
    });
  };
  
  const handleEditDestination = (destination: Destination) => {
    setCurrentDestination(destination);
    setIsEditing(true);
    setFormOpen(true);
  };
  
  const handleDeleteDestination = async (id: number) => {
    if (confirm('Are you sure you want to delete this destination?')) {
      try {
        const { error } = await supabase
          .from('destinations')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Destination deleted successfully.',
        });
        
        fetchDestinations();
      } catch (error) {
        console.error('Error deleting destination:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete destination.',
          variant: 'destructive',
        });
      }
    }
  };

  // Itinerary handlers
  const handleOpenItineraryForm = () => {
    setItineraryFormOpen(true);
    setCurrentItineraryItem({
      day: '',
      title: '',
      description: ''
    });
    setIsEditingItinerary(false);
    setEditItineraryIndex(null);
  };

  const handleEditItineraryItem = (item: ItineraryDay, index: number) => {
    setCurrentItineraryItem(item);
    setIsEditingItinerary(true);
    setEditItineraryIndex(index);
    setItineraryFormOpen(true);
  };

  const handleDeleteItineraryItem = (index: number) => {
    const updatedItinerary = [...(currentDestination.itinerary || [])];
    updatedItinerary.splice(index, 1);
    setCurrentDestination({
      ...currentDestination,
      itinerary: updatedItinerary
    });
  };

  const handleItineraryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentItineraryItem({
      ...currentItineraryItem,
      [name]: value
    });
  };

  const handleSaveItineraryItem = () => {
    if (!currentItineraryItem.day || !currentItineraryItem.title) {
      toast({
        title: 'Error',
        description: 'Day and title are required for itinerary items.',
        variant: 'destructive',
      });
      return;
    }

    const updatedItinerary = [...(currentDestination.itinerary || [])];
    
    if (isEditingItinerary && editItineraryIndex !== null) {
      // Edit existing item
      updatedItinerary[editItineraryIndex] = currentItineraryItem;
    } else {
      // Add new item
      updatedItinerary.push(currentItineraryItem);
    }

    setCurrentDestination({
      ...currentDestination,
      itinerary: updatedItinerary
    });

    setItineraryFormOpen(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!currentDestination.name || !currentDestination.region || !currentDestination.image || !currentDestination.description || !currentDestination.price) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields.',
          variant: 'destructive',
        });
        return;
      }
      
      if (isEditing) {
        const { error } = await supabase
          .from('destinations')
          .update({
            name: currentDestination.name,
            region: currentDestination.region,
            image: currentDestination.image,
            description: currentDestination.description,
            price: currentDestination.price,
            tags: currentDestination.tags,
            top_booked: currentDestination.top_booked,
            bookings_count: currentDestination.bookings_count,
            duration_days: currentDestination.duration_days || 7,
            itinerary: currentDestination.itinerary
          })
          .eq('id', currentDestination.id!);
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Destination updated successfully.',
        });
      } else {
        const { error } = await supabase
          .from('destinations')
          .insert({
            name: currentDestination.name,
            region: currentDestination.region,
            image: currentDestination.image,
            description: currentDestination.description,
            price: currentDestination.price,
            tags: currentDestination.tags,
            top_booked: currentDestination.top_booked || false,
            bookings_count: currentDestination.bookings_count || 0,
            duration_days: currentDestination.duration_days || 7,
            itinerary: currentDestination.itinerary || []
          });
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Destination added successfully.',
        });
      }
      
      setFormOpen(false);
      resetForm();
      fetchDestinations();
    } catch (error) {
      console.error('Error saving destination:', error);
      toast({
        title: 'Error',
        description: 'Failed to save destination.',
        variant: 'destructive',
      });
    }
  };
  
  const resetForm = () => {
    setCurrentDestination({
      name: '',
      region: 'europe',
      image: '',
      description: '',
      price: '',
      tags: [],
      top_booked: false,
      bookings_count: 0,
      duration_days: 7,
      itinerary: []
    });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Destinations Management</h1>
      
      <div className="flex justify-between mb-6">
        <Button 
          onClick={() => window.history.back()} 
          variant="outline"
        >
          Back to Admin Panel
        </Button>
        <Button 
          onClick={() => {
            resetForm();
            setFormOpen(true);
          }}
          className="bg-travel-gold hover:bg-amber-600 text-black"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Destination
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="meta">Tags & Regions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="destinations" className="mt-6">
          {loading ? (
            <div className="text-center py-8">Loading destinations...</div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>All Destinations</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Top Booked</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {destinations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">No destinations found</TableCell>
                      </TableRow>
                    ) : (
                      destinations.map((destination) => (
                        <TableRow key={destination.id}>
                          <TableCell className="font-medium">{destination.name}</TableCell>
                          <TableCell className="capitalize">{destination.region}</TableCell>
                          <TableCell>{destination.price}</TableCell>
                          <TableCell>{destination.duration_days || 7} days</TableCell>
                          <TableCell>
                            {destination.top_booked ? 
                              <Badge variant="default" className="bg-green-500">Yes</Badge> : 
                              <Badge variant="outline">No</Badge>
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {destination.tags?.map((tag, index) => (
                                <Badge key={index} variant="secondary">{tag}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditDestination(destination)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteDestination(destination.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="meta" className="mt-6">
          <TagsRegionsManager />
        </TabsContent>
      </Tabs>
      
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Destination' : 'Add New Destination'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the details of this destination.' 
                : 'Fill in the details to add a new destination.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Destination Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={currentDestination.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Santorini, Greece"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="region">Region</Label>
                <Select
                  value={currentDestination.region}
                  onValueChange={(value) => handleSelectChange(value, 'region')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.length > 0 ? (
                      regions.map((region) => (
                        <SelectItem key={region.id} value={region.value}>
                          {region.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="europe">Europe</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  value={currentDestination.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div>
                <Label htmlFor="duration_days">Duration (Days)</Label>
                <Input
                  id="duration_days"
                  name="duration_days"
                  type="number"
                  min="1"
                  value={currentDestination.duration_days || 7}
                  onChange={(e) => setCurrentDestination({
                    ...currentDestination,
                    duration_days: parseInt(e.target.value) || 7
                  })}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Number of days for this trip
                </p>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={currentDestination.description}
                  onChange={handleInputChange}
                  placeholder="Write a compelling description..."
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="price">Price (with "From" prefix)</Label>
                <Input
                  id="price"
                  name="price"
                  value={currentDestination.price}
                  onChange={handleInputChange}
                  placeholder="e.g. From ₹1,299"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Include "From" if price is per person
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    id="top_booked"
                    name="top_booked"
                    type="checkbox"
                    checked={!!currentDestination.top_booked}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="top_booked">Mark as Top Booked</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Top booked destinations will appear on the homepage
                </p>
              </div>

              <div>
                <Label htmlFor="bookings_count">Bookings Count (optional)</Label>
                <Input
                  id="bookings_count"
                  name="bookings_count"
                  type="number"
                  min="0"
                  value={currentDestination.bookings_count || 0}
                  onChange={handleInputChange}
                  placeholder="0"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This will affect the sorting of top booked destinations
                </p>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {tags.length > 0 ? (
                        tags.map(tag => (
                          <SelectItem key={tag.id} value={tag.name}>
                            {tag.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Beach">Beach</SelectItem>
                          <SelectItem value="Mountain">Mountain</SelectItem>
                          <SelectItem value="City">City</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={handleAddTag} variant="outline">Add</Button>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {currentDestination.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="rounded-full hover:bg-muted p-0.5"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {tag} tag</span>
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="itinerary">Day-by-Day Itinerary</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleOpenItineraryForm}>
                    <Plus className="h-4 w-4 mr-1" /> Add Day
                  </Button>
                </div>

                {(currentDestination.itinerary && currentDestination.itinerary.length > 0) ? (
                  <div className="border rounded-md divide-y">
                    {currentDestination.itinerary.map((item, index) => (
                      <div key={index} className="p-4 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-travel-gold" />
                            <h4 className="font-medium">{item.day}</h4>
                          </div>
                          <h5 className="font-semibold mt-1">{item.title}</h5>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditItineraryItem(item, index)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteItineraryItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted rounded-md p-6 text-center">
                    <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p>No itinerary items added yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add day-by-day activities for this destination
                    </p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setFormOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-travel-gold hover:bg-amber-600 text-black">
                {isEditing ? 'Update Destination' : 'Add Destination'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Itinerary Item Dialog */}
      <Dialog open={itineraryFormOpen} onOpenChange={setItineraryFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditingItinerary ? 'Edit Itinerary Day' : 'Add Itinerary Day'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="itinerary-day">Day</Label>
              <Input
                id="itinerary-day"
                name="day"
                value={currentItineraryItem.day}
                onChange={handleItineraryInputChange}
                placeholder="e.g. Day 1-2 or Day 3"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="itinerary-title">Title</Label>
              <Input
                id="itinerary-title"
                name="title"
                value={currentItineraryItem.title}
                onChange={handleItineraryInputChange}
                placeholder="e.g. Arrival & City Tour"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="itinerary-description">Description</Label>
              <Textarea
                id="itinerary-description"
                name="description"
                value={currentItineraryItem.description}
                onChange={handleItineraryInputChange}
                placeholder="Describe the activities for this day..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setItineraryFormOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveItineraryItem} 
              className="bg-travel-gold hover:bg-amber-600 text-black"
            >
              {isEditingItinerary ? 'Update' : 'Add'} Day
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDestinations;
