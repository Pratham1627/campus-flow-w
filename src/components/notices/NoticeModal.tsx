import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from 'lucide-react';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  notice: {
    title: string;
    description: string;
    date: string;
    image: string;
  } | null;
}

const NoticeModal = ({ isOpen, onClose, notice }: NoticeModalProps) => {
  if (!notice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{notice.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(notice.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img
              src={notice.image}
              alt={notice.title}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-foreground leading-relaxed">{notice.description}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoticeModal;
