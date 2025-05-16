import React, { useState } from 'react';
import { supabaseCustom } from '../utils/supabase-custom';
import { toast } from '@/components/ui/use-toast';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  published_at: string;
}

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabaseCustom
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setBlogPosts(data as any as BlogPost[]);
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

  return (
    <div>
      {/* Blog component content */}
    </div>
  );
};

export default Blog;