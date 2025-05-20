
import * as React from "react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PieChart } from "@/components/ui/charts/PieChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Pencil, Trash, Eye, Plus, Home } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string | null;
  author: string;
  image: string;
  published_at: string | null;
  category: string | null;
  tags: string[] | null;
  status?: string;
  views?: number;
}

export function AdminBlog() {
  const [blogStats, setBlogStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    views: 0
  });

  const [categoryData, setCategoryData] = useState([]);
  const [authorData, setAuthorData] = useState([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBlogStats();
    fetchBlogPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [blogPosts, filterStatus, filterCategory, searchQuery]);

  const filterPosts = () => {
    let filtered = [...blogPosts];
    
    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(post => {
        if (filterStatus === "published") return post.published_at !== null;
        if (filterStatus === "draft") return post.published_at === null;
        return true;
      });
    }
    
    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter(post => post.category === filterCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) || 
        (post.excerpt && post.excerpt.toLowerCase().includes(query))
      );
    }
    
    setFilteredPosts(filtered);
  };

  const fetchBlogStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch blog posts data
      const { data: blogPosts, error: blogError } = await supabase
        .from('blog_posts')
        .select('id, title, status, views, category, author');

      if (blogError) throw blogError;

      // Calculate basic stats
      const published = blogPosts?.filter(post => post.status === 'published').length || 0;
      const draft = blogPosts?.filter(post => post.status === 'draft').length || 0;
      const totalViews = blogPosts?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;

      setBlogStats({
        total: blogPosts?.length || 0,
        published,
        draft,
        views: totalViews
      });

      // Process category data for chart
      const categoryCounts = {};
      blogPosts?.forEach(post => {
        if (post.category) {
          categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
        }
      });

      const formattedCategoryData = Object.keys(categoryCounts).map(category => ({
        name: category,
        value: categoryCounts[category]
      }));
      setCategoryData(formattedCategoryData);

      // Process author data for chart
      const authorCounts = {};
      blogPosts?.forEach(post => {
        if (post.author) {
          authorCounts[post.author] = (authorCounts[post.author] || 0) + 1;
        }
      });

      const formattedAuthorData = Object.keys(authorCounts).map(author => ({
        name: author,
        value: authorCounts[author]
      }));
      
      setAuthorData(formattedAuthorData);
    } catch (error) {
      console.error('Error fetching blog stats:', error);
      toast({
        title: "Error",
        description: "Failed to load blog statistics",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all blog posts
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false, nullsLast: true });
      
      if (error) throw error;
      
      if (data) {
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(post => post.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
        // Process posts to add status
        const processedPosts = data.map(post => ({
          ...post,
          status: post.published_at ? 'published' : 'draft'
        }));
        
        setBlogPosts(processedPosts);
        setFilteredPosts(processedPosts);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setEditPost(post);
    setIsEditDialogOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPost) return;
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: editPost.title,
          excerpt: editPost.excerpt,
          content: editPost.content,
          category: editPost.category,
          tags: editPost.tags,
          published_at: editPost.status === 'published' ? 
            (editPost.published_at || new Date().toISOString()) : 
            null
        })
        .eq('id', editPost.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Blog post updated successfully"
      });
      
      fetchBlogPosts();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast({
        title: "Error",
        description: "Failed to update blog post",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postToDelete);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Blog post deleted successfully"
      });
      
      fetchBlogPosts();
      setIsDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not published";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  // More vibrant colors for the charts that work in both light and dark modes
  const categoryColors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", 
    "#98D8C8", "#F06595", "#748FFC", "#7950F2", 
    "#FAB005", "#20C997", "#82C91E", "#FF922B"
  ];
  
  const authorColors = [
    "#845EC2", "#D65DB1", "#FF6F91", "#FF9671", 
    "#FFC75F", "#F9F871", "#2C73D2", "#0089BA", 
    "#008E9B", "#00C9A7", "#C4FCEF", "#B39CD0"
  ];

  return (
    <div className="container mx-auto py-6">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Blog Management</h1>
            <p className="text-muted-foreground">Analyze and manage your blog content</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/admin"><Home className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="manage">Manage Posts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{blogStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{blogStats.published}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{blogStats.draft}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{blogStats.views}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="dark:border-muted">
              <CardHeader>
                <CardTitle>Posts by Category</CardTitle>
                <CardDescription>Distribution of blog posts across categories</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <PieChart
                  data={categoryData}
                  category="value"
                  index="name"
                  colors={categoryColors}
                  valueFormatter={(value) => `${value} posts`}
                  height={250}
                  emptyMessage="No category data available"
                  className="[&_.recharts-text]:dark:fill-foreground [&_.recharts-legend-item-text]:dark:text-foreground"
                />
              </CardContent>
            </Card>

            <Card className="dark:border-muted">
              <CardHeader>
                <CardTitle>Posts by Author</CardTitle>
                <CardDescription>Blog posts per author</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <PieChart
                  data={authorData}
                  category="value"
                  index="name"
                  colors={authorColors}
                  valueFormatter={(value) => `${value} posts`}
                  height={250}
                  emptyMessage="No author data available"
                  className="[&_.recharts-text]:dark:fill-foreground [&_.recharts-legend-item-text]:dark:text-foreground"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Blog Posts</CardTitle>
              <CardDescription>Manage your blog posts, edit content or change publication status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
                <div className="flex flex-col md:flex-row gap-4">
                  <div>
                    <Input
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button>
                  <Link to="/admin/blog/new" className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" /> New Post
                  </Link>
                </Button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No blog posts found matching your criteria.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPosts.map(post => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">{post.title}</TableCell>
                          <TableCell>{post.category || "Uncategorized"}</TableCell>
                          <TableCell>{post.author}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              post.published_at ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {post.published_at ? 'Published' : 'Draft'}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(post.published_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`/blog/${post.id}`} target="_blank">
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEditPost(post)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setPostToDelete(post.id);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>
              Make changes to your blog post here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          {editPost && (
            <form onSubmit={handleSavePost}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title</label>
                  <Input
                    id="title"
                    value={editPost.title}
                    onChange={(e) => setEditPost({...editPost, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="excerpt" className="text-sm font-medium">Excerpt</label>
                  <Textarea
                    id="excerpt"
                    value={editPost.excerpt || ''}
                    onChange={(e) => setEditPost({...editPost, excerpt: e.target.value})}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium">Content</label>
                  <Textarea
                    id="content"
                    value={editPost.content || ''}
                    onChange={(e) => setEditPost({...editPost, content: e.target.value})}
                    rows={5}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <Select
                      value={editPost.category || ''}
                      onValueChange={(value) => setEditPost({...editPost, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <Select
                      value={editPost.status}
                      onValueChange={(value) => setEditPost({...editPost, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminBlog;
