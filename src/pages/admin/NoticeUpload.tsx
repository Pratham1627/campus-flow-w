import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NoticeUpload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // In a real application, this would send the data to a backend
    toast({
      title: 'Success',
      description: 'Notice uploaded successfully!',
    });

    // Reset form
    setTitle('');
    setDescription('');
    setImagePreview(null);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Upload Notice
        </h1>
        <p className="text-muted-foreground">
          Create and publish new notices for students
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="neumorphic">
          <CardHeader>
            <CardTitle>Notice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Notice Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter notice title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter notice description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Upload Image (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended size: 800x600px
                </p>
              </div>

              <Button type="submit" className="w-full gradient-primary">
                <Upload className="w-4 h-4 mr-2" />
                Publish Notice
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="neumorphic">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Image uploaded
                </div>
              </div>
            ) : (
              <div className="w-full h-64 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-accent/30">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No image uploaded
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  {title || 'Notice Title'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {description || 'Notice description will appear here...'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="neumorphic">
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-smooth"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Sample Notice {i}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded 2 days ago
                    </p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoticeUpload;
