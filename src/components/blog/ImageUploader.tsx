
import { useState } from 'react';
import { Upload, X, Image, FileVideo, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploaderProps {
  onImagesUploaded: (urls: string[]) => void;
}

const ImageUploader = ({ onImagesUploaded }: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    // Validate file types
    const validFiles = selectedFiles.filter(file => {
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      return isValid;
    });

    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid file type",
        description: "Only images and videos are allowed",
        variant: "destructive"
      });
    }

    // Create previews for images
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setFiles(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setFiles(files.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `blog/${fileName}`;
        
        // Add watermark text to image metadata (note: this doesn't actually add a visible watermark)
        const fileOptions = {
          metadata: {
            watermark: "seetanarayantravels.com",
            cacheControl: "max-age=31536000, immutable",
          }
        };
        
        const { error: uploadError, data } = await supabase.storage
          .from('blog-media')
          .upload(filePath, file, fileOptions);
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('blog-media')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrl);
      }
      
      toast({
        title: "Upload successful",
        description: `${files.length} file(s) uploaded successfully`,
      });
      
      onImagesUploaded(uploadedUrls);
      
      // Clear files after successful upload
      setFiles([]);
      setPreviewUrls([]);
      
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-6 w-6" />;
    if (file.type.startsWith('video/')) return <FileVideo className="h-6 w-6" />;
    return <FileText className="h-6 w-6" />;
  };

  const triggerFileInput = () => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Media Upload</h3>
        {files.length > 0 && (
          <Button 
            onClick={uploadFiles} 
            disabled={uploading}
            className="bg-travel-gold hover:bg-amber-600 text-black"
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
          </Button>
        )}
      </div>
      
      <Card className="border-dashed border-2 p-4 text-center">
        <label className="cursor-pointer flex flex-col items-center justify-center p-6">
          <Upload className="h-8 w-8 mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-1">Drag and drop your files here</p>
          <p className="text-xs text-gray-400">or click to select files</p>
          <input 
            type="file" 
            multiple 
            onChange={handleFileSelect} 
            className="hidden" 
            accept="image/*,video/*"
          />
          <Button 
            type="button" 
            variant="secondary" 
            className="mt-4"
            onClick={triggerFileInput}
          >
            Select Files
          </Button>
        </label>
      </Card>
      
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square overflow-hidden rounded-md border bg-gray-100">
                {files[index].type.startsWith('image/') ? (
                  <img 
                    src={url} 
                    alt={`Preview ${index}`} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    {getFileIcon(files[index])}
                    <span className="ml-2 text-xs truncate">{files[index].name}</span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => removeFile(index)} 
                className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
