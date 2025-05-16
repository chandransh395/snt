import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import supabaseCustom from "@/utils/supabase-custom";

const BlogHero = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80)",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-playfair">
            Travel <span className="text-travel-gold">Journal</span>
          </h1>
          <div className="w-24 h-1 bg-travel-gold mx-auto mb-6"></div>
          <p className="text-xl text-gray-200 mb-8">
            Insights, inspiration, and insider tips from our travel experts and global explorers.
          </p>
        </div>
      </div>
    </section>
  );
};

type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  published_at: string;
  tags: string[] | null;
  content: string;
};

const BlogList = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabaseCustom
          .from('blog_posts')
          .select('*')
          .order('published_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching blog posts:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          setBlogPosts(data as BlogPost[]);
        } else {
          // Use default static data if no posts are found in the database
          setBlogPosts([
            {
              id: 1,
              title: "The Hidden Gems of Kyoto: Beyond the Tourist Trail",
              excerpt: "Discover secret temples, local eateries, and peaceful gardens that most visitors to Kyoto never see.",
              image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
              category: "destinations",
              author: "Emma Richards",
              published_at: "2023-05-12T00:00:00Z",
              tags: ["japan", "kyoto", "travel"],
              content: "Full content here..."
            },
            {
              id: 2,
              title: "Sustainable Travel: How to Minimize Your Environmental Impact",
              excerpt: "Practical tips for reducing your carbon footprint while still experiencing all the world has to offer.",
              image: "https://images.unsplash.com/photo-1569144157591-c60f3f82f137?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
              category: "tips",
              author: "Daniel Richards",
              published_at: "2023-04-28T00:00:00Z",
              tags: ["sustainable", "eco-friendly", "travel"],
              content: "Full content here..."
            },
            {
              id: 3,
              title: "The Art of Slow Travel: Embracing the Journey",
              excerpt: "Why spending more time in fewer places leads to deeper, more meaningful travel experiences.",
              image: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
              category: "inspiration",
              author: "Sofia Martinez",
              published_at: "2023-03-15T00:00:00Z",
              tags: ["slow travel", "mindful travel", "travel"],
              content: "Full content here..."
            },
            {
              id: 4,
              title: "A Culinary Tour of Tuscany: From Farm to Table",
              excerpt: "Explore the rich gastronomic traditions of Tuscany through its local farms, vineyards, and eateries.",
              image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1466&q=80",
              category: "food",
              author: "James Wilson",
              published_at: "2023-02-22T00:00:00Z",
              tags: ["tuscany", "food tour", "italy"],
              content: "Full content here..."
            },
            {
              id: 5,
              title: "Photography Tips for Capturing Your Travel Memories",
              excerpt: "Expert techniques for taking stunning travel photos that tell the story of your journey.",
              image: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
              category: "tips",
              author: "Emma Richards",
              published_at: "2023-01-30T00:00:00Z",
              tags: ["photography", "travel photos", "tips"],
              content: "Full content here..."
            },
            {
              id: 6,
              title: "Safari Season: When to Visit Africa's Wildlife Reserves",
              excerpt: "A month-by-month guide to wildlife viewing opportunities across Africa's most spectacular national parks.",
              image: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
              category: "destinations",
              author: "Daniel Richards",
              published_at: "2022-12-18T00:00:00Z",
              tags: ["safari", "africa", "wildlife"],
              content: "Full content here..."
            },
          ]);
        }
      } catch (error) {
        console.error('Error loading blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  const filteredPosts = activeCategory === "all"
    ? blogPosts
    : blogPosts.filter(post => post.category === activeCategory);

  // Calculate read time based on content length
  const getReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content?.split(/\s/g)?.length || 0;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-4 mb-12 justify-center">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === "all"
                  ? "bg-travel-gold text-white"
                  : "bg-background text-muted-foreground hover:bg-travel-gold/10"
              }`}
            >
              All Posts
            </button>
            <button
              onClick={() => setActiveCategory("destinations")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === "destinations"
                  ? "bg-travel-gold text-white"
                  : "bg-background text-muted-foreground hover:bg-travel-gold/10"
              }`}
            >
              Destinations
            </button>
            <button
              onClick={() => setActiveCategory("tips")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === "tips"
                  ? "bg-travel-gold text-white"
                  : "bg-background text-muted-foreground hover:bg-travel-gold/10"
              }`}
            >
              Travel Tips
            </button>
            <button
              onClick={() => setActiveCategory("inspiration")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === "inspiration"
                  ? "bg-travel-gold text-white"
                  : "bg-background text-muted-foreground hover:bg-travel-gold/10"
              }`}
            >
              Inspiration
            </button>
            <button
              onClick={() => setActiveCategory("food")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === "food"
                  ? "bg-travel-gold text-white"
                  : "bg-background text-muted-foreground hover:bg-travel-gold/10"
              }`}
            >
              Food & Cuisine
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-travel-gold"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <Card key={post.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="object-cover w-full h-full transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-3 py-1 bg-travel-gold text-white text-xs font-semibold rounded-full capitalize">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <span>{formatDate(post.published_at)}</span>
                      <span className="mx-2">•</span>
                      <span>{getReadTime(post.content)}</span>
                    </div>
                    <Link to={`/blog/${post.id}`}>
                      <h3 className="text-xl font-bold mb-3 hover:text-travel-gold transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                    <div className="flex items-center">
                      <div className="text-sm">
                        <span className="text-muted-foreground">By </span>
                        <span className="font-medium">{post.author}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button className="inline-flex items-center px-6 py-3 bg-travel-gold hover:bg-amber-600 text-black font-medium rounded-md transition-colors">
              Load More Articles
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const Newsletter = () => {
  return (
    <section className="py-20 bg-secondary text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">
            Subscribe to Our <span className="text-travel-gold">Newsletter</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Get travel inspiration, tips, and exclusive offers delivered straight to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-md border border-gray-600 bg-gray-800 text-white"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-travel-gold hover:bg-amber-600 text-black font-medium rounded-md transition-colors"
            >
              Subscribe
            </button>
          </form>
          <p className="text-sm text-gray-400 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

const Blog = () => {
  return (
    <>
      <BlogHero />
      <BlogList />
      <Newsletter />
    </>
  );
};

export default Blog;
