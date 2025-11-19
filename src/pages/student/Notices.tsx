import { useState } from 'react';
import NoticeCard from '@/components/notices/NoticeCard';
import NoticeModal from '@/components/notices/NoticeModal';
import { noticesData } from '@/utils/dummyData';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const Notices = () => {
  const [selectedNotice, setSelectedNotice] = useState<typeof noticesData[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNoticeClick = (notice: typeof noticesData[0]) => {
    setSelectedNotice(notice);
    setIsModalOpen(true);
  };

  const filteredNotices = noticesData.filter(
    (notice) =>
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Notices & Announcements
          </h1>
          <p className="text-muted-foreground">
            Stay updated with the latest college notifications
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotices.map((notice) => (
          <NoticeCard
            key={notice.id}
            title={notice.title}
            description={notice.description}
            date={notice.date}
            image={notice.image}
            onClick={() => handleNoticeClick(notice)}
          />
        ))}
      </div>

      {filteredNotices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No notices found matching your search.</p>
        </div>
      )}

      <NoticeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        notice={selectedNotice}
      />
    </div>
  );
};

export default Notices;
