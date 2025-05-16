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
import { X, Edit, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '@/utils/currency';
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

type Tag = {
  id: number;
  name: string;
};

const AdminDestinations = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDestination, setCurrentDestination] = useState<Partial<Destination>>({
    name: '',
    region: 'europe',
    image: '',
    description: '',
    price: '',
    tags: []
  });
  const [selectedTag, setSelectedTag] = useState('');
  
  // Redirect if not logged in or not an admin
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  useEffect(() => {
    fetchDestinations();
    fetchTags();
  }, []);
  
  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseCustom
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
      const { data, error } = await supabaseCustom
        .from('tags')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setTags(data as any as Tag[] || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentDestination({
      ...currentDestination,
      [name]: value,
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
        const { error } = await supabaseCustom
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
        const { error } = await supabaseCustom
          .from('destinations')
          .update({
            name: currentDestination.name,
            region: currentDestination.region,
            image: currentDestination.image,
            description: currentDestination.description,
            price: currentDestination.price,
            tags: currentDestination.tags,
          })
          .eq('id', currentDestination.id);
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Destination updated successfully.',
        });
      } else {
        const { error } = await supabaseCustom
          .from('destinations')
          .insert({
            name: currentDestination.name,
            region: currentDestination.region,
            image: currentDestination.image,
            description: currentDestination.description,
            price: currentDestination.price,
            tags: currentDestination.tags,
          });
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Destination added successfully.',
        });
      }
      
      setFormOpen(false);
      setCurrentDestination({
        name: '',
        region: 'europe',
        image: '',
        description: '',
        price: '',
        tags: []
      });
      setIsEditing(false);
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
      tags: []
    });
    setIsEditing(false);
  };

  const regions = [
    { value: 'europe', label: 'Europe' },
    { value: 'asia', label: 'Asia' },
    { value: 'americas', label: 'The Americas' },
    { value: 'africa', label: 'Africa' },
    { value: 'oceania', label: 'Oceania' },
  ];

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
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {destinations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No destinations found</TableCell>
                  </TableRow>
                ) : (
                  destinations.map((destination) => (
                    <TableRow key={destination.id}>
                      <TableCell className="font-medium">{destination.name}</TableCell>
                      <TableCell className="capitalize">{destination.region}</TableCell>
                      <TableCell>{destination.price}</TableCell>
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
      
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Destination' : 'Add New Destination'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the details of this destination.' 
                : 'Fill in the details to add a new destination.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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
                    {regions.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
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
              </div>
              
              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beach">Beach</SelectItem>
                      <SelectItem value="Mountain">Mountain</SelectItem>
                      <SelectItem value="City">City</SelectItem>
                      <SelectItem value="Cultural">Cultural</SelectItem>
                      <SelectItem value="Adventure">Adventure</SelectItem>
                      <SelectItem value="Relaxation">Relaxation</SelectItem>
                      <SelectItem value="Historical">Historical</SelectItem>
                      <SelectItem value="Nature">Nature</SelectItem>
                      <SelectItem value="Family">Family</SelectItem>
                      <SelectItem value="Romantic">Romantic</SelectItem>
                      <SelectItem value="Pilgrimage">Pilgrimage</SelectItem>
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
    </div>
  );
};

export default AdminDestinations;
