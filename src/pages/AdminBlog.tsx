
import { useState } from 'react';
import ImageUploader from '@/components/blog/ImageUploader';
import ReactMarkdown from 'react-markdown';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const AdminBlog = () => {
  const { toast } = useToast();
  const [currentBlogPost, setCurrentBlogPost] = useState({
    title: '',
    content: '',
    image: '',
    author: '',
    category: '',
    excerpt: '',
    tags: [] as string[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentBlogPost((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="content">Content</Label>
      <div className="space-y-4">
        <Textarea
          id="content"
          name="content"
          value={currentBlogPost.content}
          onChange={handleInputChange}
          placeholder="Write your blog post content using Markdown..."
          rows={15}
          required
        />
        <div className="p-4 border rounded-md bg-gray-50">
          <p className="text-sm text-muted-foreground mb-2">Markdown Preview:</p>
          <div className="prose max-w-none">
            <ReactMarkdown>
              {currentBlogPost.content || '*No content yet*'}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        Use Markdown for formatting: **bold**, *italic*, # Heading, ## Subheading, - list item, etc.
      </p>

      <div className="mt-6 pt-6 border-t">
        <ImageUploader 
          onImagesUploaded={(urls) => {
            if (!Array.isArray(urls)) {
              return;
            }
            // Insert image URLs at cursor position or append to content
            const contentWithImages = currentBlogPost.content + '\n\n' + 
              urls.map(url => `![Image](${url})`).join('\n\n');
            setCurrentBlogPost({
              ...currentBlogPost,
              content: contentWithImages,
            });
          }}
        />
      </div>
    </div>
  );
};

export default AdminBlog;
