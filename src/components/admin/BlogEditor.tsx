import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUploader from "@/components/blog/ImageUploader";

interface BlogPost {
  id?: number;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  image: string;
  published: boolean;
  published_at: string | null;
  category: string;
  tags: string[];
}

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  
  // Default blog post state
  const [post, setPost] = useState<BlogPost>({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    image: '',
    published: false,
    published_at: null,
    category: '',
    tags: [],
  });
  
  const isEditing = !!id;
  
  // Fetch the blog post if editing
  useEffect(() => {
    async function fetchPost() {
      if (!isEditing) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setPost(data as BlogPost);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast({
          title: 'Error',
          description: 'Failed to load blog post',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchPost();
    
    // Get user info to set as author
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user && !isEditing) {
        setPost(prev => ({ ...prev, author: data.user.email || 'Anonymous' }));
      }
    }
    
    getUser();
  }, [id, isEditing, toast]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
    setPost(prev => ({ ...prev, tags: tagsArray }));
  };
  
  const handleCategoryChange = (value: string) => {
    setPost(prev => ({ ...prev, category: value }));
  };
  
  const handlePublishedChange = (value: boolean) => {
    setPost(prev => ({ 
      ...prev, 
      published: value,
      published_at: value ? new Date().toISOString() : null
    }));
  };
  
  const handleSave = async () => {
    if (!post.title || !post.content) {
      toast({
        title: 'Missing information',
        description: 'Title and content are required',
        variant: 'destructive',
      });
      return;
    }
    
    setSaving(true);
    
    try {
      if (isEditing) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update({
            title: post.title,
            content: post.content,
            excerpt: post.excerpt || post.content.substring(0, 150) + '...',
            author: post.author,
            image: post.image,
            published: post.published,
            published_at: post.published_at,
            category: post.category,
            tags: post.tags,
          })
          .eq('id', id);
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Blog post updated successfully',
        });
      } else {
        // Create new post
        const { error } = await supabase
          .from('blog_posts')
          .insert({
            title: post.title,
            content: post.content,
            excerpt: post.excerpt || post.content.substring(0, 150) + '...',
            author: post.author,
            image: post.image,
            published: post.published,
            published_at: post.published_at,
            category: post.category,
            tags: post.tags,
          });
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Blog post created successfully',
        });
      }
      
      // Navigate back to blog list
      navigate('/admin/blog');
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to save blog post',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleImagesUploaded = (urls: string[]) => {
    if (urls.length > 0) {
      setPost(prev => ({ ...prev, image: urls[0] }));
      setShowImageUploader(false);
      toast({
        title: 'Image uploaded',
        description: 'Cover image has been uploaded successfully'
      });
    }
  };
  
  const insertImagesInContent = (urls: string[]) => {
    if (urls.length === 0) return;
    
    let imageMarkdown = '';
    urls.forEach(url => {
      imageMarkdown += `![Image](${url})\n\n`;
    });
    
    // Get cursor position
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    
    // Insert image markdown at cursor position
    const newContent = 
      post.content.substring(0, startPos) + 
      imageMarkdown + 
      post.content.substring(endPos);
    
    setPost(prev => ({ ...prev, content: newContent }));
    
    // Set cursor position after inserted markdown
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + imageMarkdown.length, startPos + imageMarkdown.length);
    }, 0);
    
    setShowImageUploader(false);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-travel-gold" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/blog')}
            className="mb-4 md:mb-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog Manager
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={post.published ? "outline" : "default"}
            onClick={() => handlePublishedChange(!post.published)}
            className="gap-2"
          >
            {post.published ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span className="hidden sm:inline">Mark as Draft</span>
                <span className="sm:hidden">Draft</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Mark as Published</span>
                <span className="sm:hidden">Publish</span>
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-travel-gold hover:bg-amber-600 text-black"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title *
                </label>
                <Input 
                  id="title"
                  name="title"
                  value={post.title}
                  onChange={handleChange}
                  placeholder="Enter blog post title"
                  className="text-lg"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-1">
                  Content *
                </label>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">
                    You can use markdown for formatting
                  </span>
                  <Button 
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowImageUploader(true)}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Insert Image
                  </Button>
                </div>
                <Textarea 
                  id="content"
                  name="content"
                  value={post.content}
                  onChange={handleChange}
                  placeholder="Write your blog post content"
                  className="min-h-[300px] font-mono"
                  required
                />
              </div>
            </CardContent>
          </Card>
          
          {showImageUploader && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Upload Image</h3>
                <ImageUploader 
                  onImagesUploaded={insertImagesInContent}
                />
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={() => setShowImageUploader(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <label htmlFor="excerpt" className="block text-sm font-medium mb-1">
                  Excerpt (Optional)
                </label>
                <Textarea 
                  id="excerpt"
                  name="excerpt"
                  value={post.excerpt}
                  onChange={handleChange}
                  placeholder="Brief summary of your post"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  If left empty, the first 150 characters of your content will be used.
                </p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="author" className="block text-sm font-medium mb-1">
                  Author
                </label>
                <Input 
                  id="author"
                  name="author"
                  value={post.author}
                  onChange={handleChange}
                  placeholder="Author name"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Category
                </label>
                <Select value={post.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Travel Tips">Travel Tips</SelectItem>
                    <SelectItem value="Destinations">Destinations</SelectItem>
                    <SelectItem value="Adventure">Adventure</SelectItem>
                    <SelectItem value="Culture">Culture</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Photography">Photography</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="tags" className="block text-sm font-medium mb-1">
                  Tags
                </label>
                <Input 
                  id="tags"
                  name="tags"
                  value={post.tags.join(', ')}
                  onChange={handleTagsChange}
                  placeholder="Add tags separated by commas"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Example: travel, asia, food
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cover Image
                </label>
                {post.image ? (
                  <div className="mb-2">
                    <img 
                      src={post.image} 
                      alt="Cover preview" 
                      className="w-full h-40 object-cover rounded-md mb-2" 
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                      onClick={() => setPost(prev => ({ ...prev, image: '' }))}
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <Button 
                    type="button" 
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setShowImageUploader(true);
                    }}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Upload Cover Image
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Status</h3>
                  <p className="text-sm text-muted-foreground">
                    {post.published ? 'Published' : 'Draft'}
                  </p>
                </div>
                <div className={`h-3 w-3 rounded-full ${
                  post.published ? 'bg-green-500' : 'bg-amber-500'
                }`} />
              </div>
              
              {post.published_at && (
                <div className="mt-4">
                  <h3 className="font-medium">Published Date</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
