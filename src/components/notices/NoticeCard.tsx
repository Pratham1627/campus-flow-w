import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface NoticeCardProps {
  title: string;
  description: string;
  date: string;
  image: string;
  onClick: () => void;
}

const NoticeCard = ({ title, description, date, image, onClick }: NoticeCardProps) => {
  return (
    <Card 
      className="neumorphic hover:shadow-xl transition-smooth cursor-pointer overflow-hidden group"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center gap-2 text-sm mb-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-foreground line-clamp-1">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default NoticeCard;
