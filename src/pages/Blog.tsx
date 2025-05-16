import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Calendar, User } from 'lucide-react';
import { supabaseCustom } from '../utils/supabase-custom';

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

const BlogHero = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.pexels.com/photos/3769138/pexels-photo-3769138.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-playfair">
            Travel <span className="text-travel-gold">Blog</span>
          </h1>
          <div className="w-24 h-1 bg-travel-gold mx-auto mb-6"></div>
          <p className="text-xl text-gray-200 mb-8">
            Discover travel tips, destination guides, and inspiring stories from our global adventures.
          </p>
        </div>
      </div>
    </section>
  );
};

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabaseCustom
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setBlogPosts(data as BlogPost[]);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog posts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <BlogHero />
      
      <div className="container mx-auto py-16 px-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : blogPosts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No Blog Posts Yet</h2>
            <p className="text-muted-foreground">
              Check back soon for travel stories and destination guides.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  {post.category && (
                    <Badge 
                      className="absolute top-4 left-4 bg-travel-gold text-black"
                    >
                      {post.category}
                    </Badge>
                  )}
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl mb-2">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(post.published_at)}
                    </span>
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {post.author}
                    </span>
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">
                    {post.excerpt || post.content}
                  </p>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-4">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="mt-auto pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full border-travel-gold text-travel-gold hover:bg-travel-gold hover:text-white"
                  >
                    Read More
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Blog;