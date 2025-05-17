
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Edit, Trash, Save, Plus } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { Label } from "@/components/ui/label";

type Tag = {
  id: number;
  name: string;
};

type Region = {
  id: number;
  name: string;
  value: string;
};

const TagsRegionsManager = () => {
  const [activeTab, setActiveTab] = useState("tags");
  const [tags, setTags] = useState<Tag[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentItem, setCurrentItem] = useState<{ id?: number; name: string; value?: string }>({ 
    name: '',
    value: '' 
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      if (activeTab === "tags") {
        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setTags(data || []);
      } else {
        const { data, error } = await supabase
          .from('regions')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setRegions(data as Region[] || []);
      }
    } catch (err) {
      console.error(`Error fetching ${activeTab}:`, err);
      toast({
        title: 'Error',
        description: `Failed to load ${activeTab}.`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Tag | Region) => {
    setCurrentItem({
      id: item.id,
      name: item.name,
      value: 'value' in item ? item.value : undefined
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Are you sure you want to delete this ${activeTab === "tags" ? "tag" : "region"}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from(activeTab)
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `${activeTab === "tags" ? "Tag" : "Region"} deleted successfully.`,
      });
      
      fetchData();
    } catch (err) {
      console.error(`Error deleting ${activeTab}:`, err);
      toast({
        title: 'Error',
        description: `Failed to delete ${activeTab === "tags" ? "tag" : "region"}.`,
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (activeTab === "tags" && !currentItem.name) {
        toast({
          title: 'Error',
          description: 'Tag name is required.',
          variant: 'destructive',
        });
        return;
      }
      
      if (activeTab === "regions" && (!currentItem.name || !currentItem.value)) {
        toast({
          title: 'Error',
          description: 'Region name and value are required.',
          variant: 'destructive',
        });
        return;
      }
      
      if (isEditing) {
        const { error } = await supabase
          .from(activeTab)
          .update(currentItem)
          .eq('id', currentItem.id!);
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: `${activeTab === "tags" ? "Tag" : "Region"} updated successfully.`,
        });
      } else {
        const { error } = await supabase
          .from(activeTab)
          .insert(currentItem);
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: `${activeTab === "tags" ? "Tag" : "Region"} added successfully.`,
        });
      }
      
      setShowForm(false);
      setIsEditing(false);
      setCurrentItem({ name: '', value: '' });
      fetchData();
    } catch (err) {
      console.error(`Error saving ${activeTab}:`, err);
      toast({
        title: 'Error',
        description: `Failed to save ${activeTab === "tags" ? "tag" : "region"}.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manage Tags & Regions</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="regions">Regions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tags">
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentItem({ name: '', value: '' });
                  setShowForm(true);
                }}
              >
                <Plus className="h-4 w-4" /> Add New Tag
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4">No tags found</TableCell>
                    </TableRow>
                  ) : (
                    tags.map(tag => (
                      <TableRow key={tag.id}>
                        <TableCell>{tag.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(tag)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(tag.id)}>
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          
          <TabsContent value="regions">
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentItem({ name: '', value: '' });
                  setShowForm(true);
                }}
              >
                <Plus className="h-4 w-4" /> Add New Region
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">No regions found</TableCell>
                    </TableRow>
                  ) : (
                    regions.map(region => (
                      <TableRow key={region.id}>
                        <TableCell>{region.name}</TableCell>
                        <TableCell>{region.value}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(region)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(region.id)}>
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 
                `Edit ${activeTab === "tags" ? "Tag" : "Region"}` : 
                `Add New ${activeTab === "tags" ? "Tag" : "Region"}`
              }
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={currentItem.name} 
                onChange={handleInputChange} 
                placeholder={`${activeTab === "tags" ? "Tag" : "Region"} name`}
                required
              />
            </div>
            
            {activeTab === "regions" && (
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input 
                  id="value" 
                  name="value" 
                  value={currentItem.value || ''} 
                  onChange={handleInputChange} 
                  placeholder="Region value (e.g. europe, asia)"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The value should be lowercase with no spaces, used in URLs and filters.
                </p>
              </div>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-travel-gold hover:bg-amber-600 text-black flex items-center gap-1">
                <Save className="h-4 w-4" />
                {isEditing ? 'Update' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TagsRegionsManager;
