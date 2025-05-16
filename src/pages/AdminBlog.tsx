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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { X, Edit, Plus, Trash2 } from 'lucide-react';
import { supabaseCustom } from '@/utils/supabase-custom';

type BlogPost = {
  id: number;
  title: string;
  author: string;
  content: string;
  image: string;
  excerpt: string | null;
  published_at: string;
  category: string;
  tags: string[] | null;
};

const AdminBlog = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlogPost, setCurrentBlogPost] = useState<Partial<BlogPost>>({
    title: '',
    author: '',
    content: '',
    image: '',
    excerpt: '',
    category: 'travel-tips',
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
    fetchBlogPosts();
  }, []);
  
  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseCustom
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });
        
      if (error) throw error;
      setBlogPosts((data as any as BlogPost[]) || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch blog posts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentBlogPost({
      ...currentBlogPost,
      [name]: value,
    });
  };
  
  const handleSelectChange = (value: string, field: string) => {
    setCurrentBlogPost({
      ...currentBlogPost,
      [field]: value,
    });
  };
  
  const handleAddTag = () => {
    if (selectedTag && !currentBlogPost.tags?.includes(selectedTag)) {
      setCurrentBlogPost({
        ...currentBlogPost,
        tags: [...(currentBlogPost.tags || []), selectedTag],
      });
      setSelectedTag('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setCurrentBlogPost({
      ...currentBlogPost,
      tags: currentBlogPost.tags?.filter(t => t !== tag),
    });
  };
  
  const handleEditBlogPost = (blogPost: BlogPost) => {
    setCurrentBlogPost(blogPost);
    setIsEditing(true);
    setFormOpen(true);
  };
  
  const handleDeleteBlogPost = async (id: number) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      try {
        const { error } = await supabaseCustom
          .from('blog_posts')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Blog post deleted successfully.',
        });
        
        fetchBlogPosts();
      } catch (error) {
        console.error('Error deleting blog post:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete blog post.',
          variant: 'destructive',
        });
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!currentBlogPost.title || !currentBlogPost.author || !currentBlogPost.content || !currentBlogPost.image) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields.',
          variant: 'destructive',
        });
        return;
      }
      
      const now = new Date().toISOString();
      
      if (isEditing) {
        const { error } = await supabaseCustom
          .from('blog_posts')
          .update({
            title: currentBlogPost.title,
            author: currentBlogPost.author,
            content: currentBlogPost.content,
            image: currentBlogPost.image,
            excerpt: currentBlogPost.excerpt,
            category: currentBlogPost.category,
            tags: currentBlogPost.tags,
          })
          .eq('id', currentBlogPost.id);
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Blog post updated successfully.',
        });
      } else {
        const { error } = await supabaseCustom
          .from('blog_posts')
          .insert({
            title: currentBlogPost.title,
            author: currentBlogPost.author,
            content: currentBlogPost.content,
            image: currentBlogPost.image,
            excerpt: currentBlogPost.excerpt,
            category: currentBlogPost.category,
            tags: currentBlogPost.tags,
            published_at: now
          });
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Blog post added successfully.',
        });
      }
      
      setFormOpen(false);
      setCurrentBlogPost({
        title: '',
        author: '',
        content: '',
        image: '',
        excerpt: '',
        category: 'travel-tips',
        tags: []
      });
      setIsEditing(false);
      fetchBlogPosts();
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to save blog post.',
        variant: 'destructive',
      });
    }
  };
  
  const resetForm = () => {
    setCurrentBlogPost({
      title: '',
      author: '',
      content: '',
      image: '',
      excerpt: '',
      category: 'travel-tips',
      tags: []
    });
    setIsEditing(false);
  };
  
  const categories = [
    { value: 'travel-tips', label: 'Travel Tips' },
    { value: 'destination-guide', label: 'Destination Guide' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'culture', label: 'Culture & History' },
    { value: 'food', label: 'Food & Cuisine' },
  ];
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Blog Management</h1>
      
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
          Add Blog Post
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading blog posts...</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Blog Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No blog posts found</TableCell>
                  </TableRow>
                ) : (
                  blogPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell>{formatDate(post.published_at)}</TableCell>
                      <TableCell className="capitalize">
                        {post.category?.replace(/-/g, ' ')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBlogPost(post)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBlogPost(post.id)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Blog Post' : 'Add New Blog Post'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the details of this blog post.' 
                : 'Fill in the details to add a new blog post.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={currentBlogPost.title}
                  onChange={handleInputChange}
                  placeholder="Enter blog post title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  name="author"
                  value={currentBlogPost.author}
                  onChange={handleInputChange}
                  placeholder="Author name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="image">Featured Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  value={currentBlogPost.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="excerpt">Excerpt/Summary</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={currentBlogPost.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief summary of the post (for previews)"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={currentBlogPost.content}
                  onChange={handleInputChange}
                  placeholder="Write your blog post content..."
                  rows={10}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={currentBlogPost.category}
                  onValueChange={(value) => handleSelectChange(value, 'category')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Adventure">Adventure</SelectItem>
                      <SelectItem value="Culture">Culture</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Tips">Tips</SelectItem>
                      <SelectItem value="Budget">Budget</SelectItem>
                      <SelectItem value="Luxury">Luxury</SelectItem>
                      <SelectItem value="Family">Family</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="History">History</SelectItem>
                      <SelectItem value="Nature">Nature</SelectItem>
                      <SelectItem value="Pilgrimage">Pilgrimage</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={handleAddTag} variant="outline">Add</Button>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {currentBlogPost.tags?.map((tag, index) => (
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
                {isEditing ? 'Update Blog Post' : 'Publish Blog Post'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlog;
