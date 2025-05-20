import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { fetchBlogStats, ensureBlogTablesExist, BlogStats } from '@/utils/admin-blog-stats';

const AdminBlog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BlogStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    mostViewedPost: null,
    recentEngagement: 0
  });

  // Add filter state
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize blog tables if needed
  useEffect(() => {
    ensureBlogTablesExist();
  }, []);

  useEffect(() => {
    fetchPosts();
    loadBlogStats();
  }, [filter]);

  const loadBlogStats = async () => {
    try {
      const blogStats = await fetchBlogStats();
      setStats(blogStats);
    } catch (error) {
      console.error("Error loading blog statistics:", error);
      toast({
        title: "Error",
        description: "Failed to load blog statistics",
        variant: "destructive"
      });
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('blog_posts')
        .select('*');
        
      // Apply filter
      if (filter === 'published') {
        query = query.eq('published', true);
      } else if (filter === 'drafts') {
        query = query.eq('published', false);
      }
      
      // Apply search if provided
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }
      
      // Order by published_date or created_at, most recent first
      query = query.order('published_date', { ascending: false, nullsFirst: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', postId);
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Blog post deleted successfully',
        });
        
        // Refresh the posts list
        fetchPosts();
        loadBlogStats();
      } catch (error) {
        console.error('Error deleting post:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete blog post',
          variant: 'destructive',
        });
      }
    }
  };

  const handleTogglePublish = async (post: any) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ published: !post.published })
        .eq('id', post.id);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Post ${post.published ? 'unpublished' : 'published'} successfully`,
      });
      
      // Refresh the posts list
      fetchPosts();
      loadBlogStats();
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update blog post',
        variant: 'destructive',
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Blog Manager</h1>
        <p className="text-muted-foreground">Manage your blog posts and content</p>
      </header>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Posts</h3>
          <p className="text-3xl font-bold">{stats.totalPosts}</p>
        </Card>
        
        <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Published</h3>
          <p className="text-3xl font-bold">{stats.publishedPosts}</p>
        </Card>
        
        <Card className="p-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Drafts</h3>
          <p className="text-3xl font-bold">{stats.draftPosts}</p>
        </Card>
        
        <Card className="p-4 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Recent Engagement</h3>
          <p className="text-3xl font-bold">{stats.recentEngagement}</p>
        </Card>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className="whitespace-nowrap"
          >
            All Posts
          </Button>
          <Button 
            variant={filter === 'published' ? 'default' : 'outline'}
            onClick={() => setFilter('published')}
            className="whitespace-nowrap"
          >
            Published
          </Button>
          <Button 
            variant={filter === 'drafts' ? 'default' : 'outline'}
            onClick={() => setFilter('drafts')}
            className="whitespace-nowrap"
          >
            Drafts
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
          <form onSubmit={handleSearch} className="flex gap-2 w-full">
            <Input
              type="search"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="min-w-[200px]"
            />
            <Button type="submit">Search</Button>
          </form>
          <Button onClick={() => navigate('/admin/blog/new')} className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" /> New Post
          </Button>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <h2 className="text-2xl font-semibold mb-2">No Posts Found</h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? `No posts found matching "${searchQuery}"`
              : filter !== 'all'
                ? `No ${filter} posts found`
                : 'Start creating your first blog post!'}
          </p>
          <Button onClick={() => navigate('/admin/blog/new')}>
            <Plus className="h-4 w-4 mr-2" /> Create New Post
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {post.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {post.published_date 
                      ? new Date(post.published_date).toLocaleDateString() 
                      : 'Not published'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.published 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                    }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {post.views || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleTogglePublish(post)}
                        title={post.published ? 'Unpublish' : 'Publish'}
                      >
                        {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 dark:text-red-400 hover:dark:text-red-300"
                        onClick={() => handleDeletePost(post.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
