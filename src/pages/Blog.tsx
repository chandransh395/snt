
// Fix just the fetchPosts function to handle the type casting
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
