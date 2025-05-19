
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

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

const BlogPost = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        
        if (!id) return;
        
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', parseInt(id))
          .single();
          
        if (error) throw error;
        
        setPost(data as BlogPost);
        
        // Fetch related posts
        if (data) {
          const { data: relatedData, error: relatedError } = await supabase
            .from('blog_posts')
            .select('id, title, image, published_at, author')
            .eq('category', data.category)
            .neq('id', data.id)
            .limit(3);
            
          if (!relatedError) {
            setRelatedPosts(relatedData as BlogPost[]);
          }
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast({
          title: 'Error',
          description: 'Failed to load blog post.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPostData();
  }, [id, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-travel-gold"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto py-16 px-4 min-h-[70vh]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Blog Post Not Found</h2>
          <p className="mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <div className="relative h-96 w-full">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${post.image})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
        <div className="container mx-auto h-full flex flex-col justify-end p-6 relative z-10">
          <Link to="/blog" className="text-white hover:text-travel-gold mb-4 inline-flex items-center">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Blog
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-white">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(post.published_at)}
            </div>
            <div className="flex items-center text-white">
              <User className="h-4 w-4 mr-1" />
              {post.author}
            </div>
            {post.category && (
              <Badge className="bg-travel-gold text-black">
                {post.category.replace(/-/g, ' ')}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown>
                {post.content}
              </ReactMarkdown>
            </div>
            
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <p className="font-medium mb-2">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-4">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Related Posts</h3>
              {relatedPosts.length > 0 ? (
                <div className="space-y-4">
                  {relatedPosts.map((related) => (
                    <Link 
                      key={related.id}
                      to={`/blog/${related.id}`}
                      className="block"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-20 h-16 overflow-hidden rounded bg-gray-200">
                          <img 
                            src={related.image} 
                            alt={related.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium line-clamp-2 hover:text-travel-gold transition-colors">
                            {related.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(related.published_at)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No related posts found</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="container mx-auto pb-12 px-4">
        <div className="flex justify-between">
          <Link to="/blog">
            <Button variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" />
              All Posts
            </Button>
          </Link>
          <Link to="/blog">
            <Button variant="outline">
              Next Post
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default BlogPost;
