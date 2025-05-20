
import { supabase } from '@/integrations/supabase/client';

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  mostViewedPost: {
    title: string;
    views: number;
    id: number;
  } | null;
  recentEngagement: number;
}

export const fetchBlogStats = async (): Promise<BlogStats> => {
  try {
    // Get all blog posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*');

    if (error) {
      throw error;
    }

    // Default stats
    const stats: BlogStats = {
      totalPosts: posts?.length || 0,
      publishedPosts: posts?.filter(post => post.published === true).length || 0,
      draftPosts: posts?.filter(post => !post.published).length || 0,
      mostViewedPost: null,
      recentEngagement: 0
    };

    // Find most viewed post
    if (posts && posts.length > 0) {
      const mostViewed = posts.reduce((prev, current) => 
        (prev.views > current.views) ? prev : current, posts[0]);
      
      stats.mostViewedPost = {
        title: mostViewed.title,
        views: mostViewed.views || 0,
        id: mostViewed.id
      };

      // Calculate recent engagement (sum of all views in the last 30 days)
      // This is a placeholder calculation - in reality, you would need a timestamp on views
      stats.recentEngagement = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    }

    return stats;
  } catch (error) {
    console.error('Error fetching blog statistics:', error);
    // Return empty stats structure on error
    return {
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      mostViewedPost: null,
      recentEngagement: 0
    };
  }
};

// Function to create sample blog table if it doesn't exist
export const ensureBlogTablesExist = async () => {
  try {
    // Check if the blog_posts table exists by trying to select from it
    const { error } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1);
    
    // If there's an error, the table might not exist or has no data
    if (error) {
      console.log('Creating sample blog posts...');
      
      // Create some sample blog posts
      const samplePosts = [
        {
          title: "Top 10 Travel Destinations for 2025",
          content: "Explore the most exciting destinations for your next adventure...",
          excerpt: "Discover the trending travel spots that will define 2025.",
          author_id: 1,
          published: true,
          featured_image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80",
          published_date: new Date().toISOString(),
          tags: ["travel", "destinations", "2025"],
          views: 245
        },
        {
          title: "How to Pack for Any Trip: The Ultimate Guide",
          content: "Learn the best techniques for efficient packing...",
          excerpt: "Master the art of packing with these expert tips.",
          author_id: 2,
          published: true,
          featured_image: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=800&q=80",
          published_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ["packing", "tips", "travel-gear"],
          views: 189
        },
        {
          title: "Travel Photography: Capture Memories Like a Pro",
          content: "Expert tips on taking stunning travel photos with any camera...",
          excerpt: "Learn to document your journeys with breathtaking photos.",
          author_id: 1,
          published: true,
          featured_image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
          published_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ["photography", "travel", "tips"],
          views: 156
        },
        {
          title: "Sustainable Travel: Exploring Without Harming",
          content: "How to minimize your environmental impact while traveling...",
          excerpt: "Discover ways to make your travels more eco-friendly.",
          author_id: 3,
          published: false, // Draft
          featured_image: "https://images.unsplash.com/photo-1548401029-f29d2569f5e1?auto=format&fit=crop&w=800&q=80",
          tags: ["eco-friendly", "sustainable", "green-travel"],
          views: 0
        }
      ];
      
      const { error: insertError } = await supabase
        .from('blog_posts')
        .insert(samplePosts);
        
      if (insertError) {
        console.error('Error creating sample blog posts:', insertError);
      } else {
        console.log('Sample blog posts created successfully!');
      }
    }
  } catch (err) {
    console.error('Error checking or creating blog tables:', err);
  }
};
