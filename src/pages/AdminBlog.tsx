
import * as React from "react";
import { PieChart } from "@/components/ui/charts/PieChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

export function AdminBlog() {
  const [blogStats, setBlogStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    views: 0
  });

  const [categoryData, setCategoryData] = useState([]);
  const [authorData, setAuthorData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlogStats();
  }, []);

  const fetchBlogStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch blog posts data
      const { data: blogPosts, error: blogError } = await supabase
        .from('blog_posts')
        .select('id, title, status, views, category, author_id');

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
        if (post.author_id) {
          authorCounts[post.author_id] = (authorCounts[post.author_id] || 0) + 1;
        }
      });

      // Fetch author names
      const authorIds = Object.keys(authorCounts);
      if (authorIds.length > 0) {
        const { data: authors, error: authorsError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', authorIds);

        if (authorsError) throw authorsError;

        const formattedAuthorData = authors?.map(author => ({
          name: author.full_name || author.email || `Author ${author.id.slice(0, 6)}`,
          value: authorCounts[author.id]
        })) || [];

        setAuthorData(formattedAuthorData);
      }
    } catch (error) {
      console.error('Error fetching blog stats:', error);
    } finally {
      setIsLoading(false);
    }
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
        <h1 className="text-3xl font-bold">Blog Management</h1>
        <p className="text-muted-foreground">Analyze and manage your blog content</p>
      </header>

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
              className="dark:text-foreground [&_.recharts-text]:dark:fill-foreground [&_.recharts-legend-item-text]:dark:text-foreground"
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
              className="dark:text-foreground [&_.recharts-text]:dark:fill-foreground [&_.recharts-legend-item-text]:dark:text-foreground"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminBlog;
