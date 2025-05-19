
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '@/components/blog/ImageUploader';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogFooter, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X, Trash2, Plus, Edit } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  image: string;
  published_at: string;
  category: string;
  tags: string[];
}

const AdminBlog = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState('list');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [currentBlogPost, setCurrentBlogPost] = useState<Partial<BlogPost>>({
    title: '',
    content: '',
    image: '',
    author: '',
    category: '',
    excerpt: '',
    tags: []
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tagInput, setTagInput] = useState<string>('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to load blog posts: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentBlogPost((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const insertImageAtCursor = (imageUrl: string) => {
    const markdownImage = `\n\n![Image](${imageUrl})\n\n`;
    setCurrentBlogPost({
      ...currentBlogPost,
      content: currentBlogPost.content + markdownImage,
    });
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const newTag = tagInput.trim();
    if (currentBlogPost.tags?.includes(newTag)) {
      toast({
        title: 'Tag already exists',
        variant: 'destructive',
      });
      return;
    }
    
    setCurrentBlogPost({
      ...currentBlogPost,
      tags: [...(currentBlogPost.tags || []), newTag],
    });
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setCurrentBlogPost({
      ...currentBlogPost,
      tags: currentBlogPost.tags?.filter(t => t !== tag),
    });
  };

  const resetForm = () => {
    setCurrentBlogPost({
      title: '',
      content: '',
      image: '',
      author: '',
      category: '',
      excerpt: '',
      tags: []
    });
    setIsEditing(false);
  };

  const handleCreateOrUpdatePost = async () => {
    try {
      if (!currentBlogPost.title || !currentBlogPost.content || !currentBlogPost.author || !currentBlogPost.image) {
        toast({
          title: 'Missing fields',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);

      const blogData = {
        title: currentBlogPost.title,
        content: currentBlogPost.content,
        excerpt: currentBlogPost.excerpt || currentBlogPost.content.substring(0, 150) + '...',
        author: currentBlogPost.author,
        image: currentBlogPost.image,
        category: currentBlogPost.category || 'General',
        tags: currentBlogPost.tags || [],
        published_at: new Date().toISOString(),
      };

      if (isEditing && currentBlogPost.id) {
        const { error } = await supabase
          .from('blog_posts')
          .update(blogData)
          .eq('id', currentBlogPost.id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Blog post updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([blogData]);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Blog post created successfully',
        });
      }

      resetForm();
      setCurrentTab('list');
      fetchPosts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to save blog post: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setCurrentBlogPost(post);
    setIsEditing(true);
    setCurrentTab('editor');
  };

  const handleDeletePost = async (id: number) => {
    setDialogOpen(true);
    setCurrentBlogPost((prev) => ({...prev, id}));
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', currentBlogPost.id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Blog post deleted successfully',
      });
      
      fetchPosts();
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to delete blog post: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Blog Manager</h1>
        <Button 
          onClick={() => {
            resetForm();
            setCurrentTab('editor');
          }}
          className="bg-travel-gold hover:bg-amber-600 text-black"
        >
          <Plus className="mr-2 h-4 w-4" /> New Post
        </Button>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">All Posts</TabsTrigger>
          <TabsTrigger value="editor">Post Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {loadingPosts ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-travel-gold" />
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No blog posts found. Create your first post!</p>
              </CardContent>
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{post.author}</TableCell>
                    <TableCell>{post.category}</TableCell>
                    <TableCell>{new Date(post.published_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditPost(post)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={currentBlogPost.title}
                onChange={handleInputChange}
                placeholder="Enter post title"
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
                placeholder="Enter author name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="image">Featured Image URL</Label>
              <Input
                id="image"
                name="image"
                value={currentBlogPost.image}
                onChange={handleInputChange}
                placeholder="Enter image URL"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Upload an image below and use its URL here
              </p>
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                value={currentBlogPost.category}
                onChange={handleInputChange}
                placeholder="Enter category"
              />
            </div>
          </div>

          <div className="mb-6">
            <Label htmlFor="excerpt">Excerpt (optional)</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              value={currentBlogPost.excerpt}
              onChange={handleInputChange}
              placeholder="Brief description for preview (max 150 chars)"
              rows={2}
            />
            <p className="text-sm text-muted-foreground mt-1">
              If left empty, first 150 characters of content will be used
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-end gap-2 mb-2">
              <div className="flex-grow">
                <Label htmlFor="tag">Tags</Label>
                <Input
                  id="tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
              </div>
              <Button type="button" onClick={addTag}>Add Tag</Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {currentBlogPost.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex gap-1 items-center">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:bg-muted rounded-full">
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {tag}</span>
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Textarea
                  id="content"
                  name="content"
                  value={currentBlogPost.content}
                  onChange={handleInputChange}
                  placeholder="Write your blog post content using Markdown..."
                  rows={15}
                  required
                  className="font-mono"
                />
              </div>
              <div className="border rounded-md p-4 overflow-y-auto max-h-[500px]">
                <p className="text-sm text-muted-foreground mb-2">Markdown Preview:</p>
                <div className="prose max-w-none">
                  <ReactMarkdown>
                    {currentBlogPost.content || '*No content yet*'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Use Markdown for formatting: **bold**, *italic*, # Heading, ## Subheading, - list item, etc.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-medium mb-4">Image Upload</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload images and then insert them into your post. You can drag and drop or click to browse.
            </p>
            
            <ImageUploader 
              onImagesUploaded={(urls) => {
                if (!Array.isArray(urls)) return;
                
                if (urls.length === 1) {
                  // If it's the first image and no featured image is set yet, use it
                  if (!currentBlogPost.image) {
                    setCurrentBlogPost({
                      ...currentBlogPost,
                      image: urls[0],
                    });
                    toast({
                      title: 'Featured image set',
                      description: 'The uploaded image has been set as your featured image.',
                    });
                  } else {
                    insertImageAtCursor(urls[0]);
                  }
                } else {
                  // For multiple images, insert them all at the cursor
                  urls.forEach(url => insertImageAtCursor(url));
                }
              }}
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setCurrentTab('list');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateOrUpdatePost}
              disabled={loading}
              className="bg-travel-gold hover:bg-amber-600 text-black"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {isEditing ? 'Update Post' : 'Create Post'}
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlog;
