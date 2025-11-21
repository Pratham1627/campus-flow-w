import { useAuth } from '@/contexts/AuthContext';
import StatCard from '@/components/dashboard/StatCard';
import AttendanceChart from '@/components/dashboard/AttendanceChart';
import AttendanceDonut from '@/components/dashboard/AttendanceDonut';
import NoticeCard from '@/components/notices/NoticeCard';
import { 
  BookOpen, 
  CheckCircle, 
  Percent, 
  TrendingUp, 
  Calendar,
  User,
  RefreshCw
} from 'lucide-react';
import { noticesData } from '@/utils/dummyData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import NoticeModal from '@/components/notices/NoticeModal';
import { useAttendance } from '@/hooks/useAttendance';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { user } = useAuth();
  const { attendance, loading, error, refetch } = useAttendance();
  const [selectedNotice, setSelectedNotice] = useState<typeof noticesData[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNoticeClick = (notice: typeof noticesData[0]) => {
    setSelectedNotice(notice);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading attendance data...' : error ? 'Using cached data' : "Here's your academic overview"}
          </p>
        </div>
        {attendance && (
          <Button onClick={refetch} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="neumorphic">
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : attendance ? (
          <>
            <StatCard
              title="Total Classes"
              value={attendance.totalClasses}
              icon={BookOpen}
              subtitle="This semester"
            />
            <StatCard
              title="Classes Attended"
              value={attendance.presentClasses}
              icon={CheckCircle}
              subtitle="Present"
            />
            <StatCard
              title="Attendance"
              value={`${attendance.attendancePercentage.toFixed(1)}%`}
              icon={Percent}
              trend={attendance.attendancePercentage >= 60 ? 'up' : 'down'}
              trendValue={attendance.attendancePercentage >= 60 ? 'Above target' : 'Below target'}
            />
            {attendance.attendancePercentage < 60 ? (
              <StatCard
                title="Required for 60%"
                value={Math.max(0, Math.ceil((0.60 * attendance.totalClasses - attendance.presentClasses) / 0.40))}
                icon={TrendingUp}
                subtitle="More classes needed"
              />
            ) : attendance.attendancePercentage < 75 ? (
              <StatCard
                title="Required for 75%"
                value={Math.max(0, Math.ceil((0.75 * attendance.totalClasses - attendance.presentClasses) / 0.25))}
                icon={TrendingUp}
                subtitle="More classes needed"
              />
            ) : (
              <StatCard
                title="Can Miss (75%)"
                value={Math.max(0, Math.floor((attendance.presentClasses - 0.75 * attendance.totalClasses) / 0.75))}
                icon={TrendingUp}
                subtitle="Classes you can skip"
              />
            )}
          </>
        ) : (
          <div className="col-span-4 text-center text-muted-foreground">
            {error || 'No attendance data available'}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart attendance={attendance} loading={loading} />
        <AttendanceDonut attendance={attendance} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="neumorphic lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Notices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {noticesData.slice(0, 4).map((notice) => (
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
          </CardContent>
        </Card>

        <Card className="neumorphic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Quick Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-base font-medium">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Roll Number</p>
              <p className="text-base font-medium">{user?.rollNo}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Branch</p>
              <p className="text-base font-medium">{user?.branch}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Semester</p>
              <p className="text-base font-medium">{user?.semester}</p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Attendance Status</p>
              {loading ? (
                <Skeleton className="h-3 w-full rounded-full" />
              ) : attendance ? (
                <>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-primary transition-all"
                      style={{ width: `${attendance.attendancePercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {attendance.attendancePercentage.toFixed(1)}% Overall
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">No data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <NoticeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        notice={selectedNotice}
      />
    </div>
  );
};

export default Dashboard;
