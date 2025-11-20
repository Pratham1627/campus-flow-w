import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { fetchSubjectAttendance, SubjectAttendance } from '@/services/subjectAttendanceService';
import { useToast } from '@/hooks/use-toast';

const SubjectAttendancePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<SubjectAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubjectAttendance = async () => {
      if (!user?.username || !user?.password) {
        console.log('[SubjectAttendance] No credentials available');
        setLoading(false);
        return;
      }

      console.log('[SubjectAttendance] Fetching data...');
      try {
        const result = await fetchSubjectAttendance(user.username, user.password);
        console.log('[SubjectAttendance] Result:', result);
        
        if (result.ok && result.subjects) {
          setSubjects(result.subjects);
          console.log('[SubjectAttendance] Loaded', result.subjects.length, 'subjects');
        } else {
          console.error('[SubjectAttendance] Error:', result.error);
          toast({
            title: 'Error',
            description: result.error || 'Failed to load subject attendance',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('[SubjectAttendance] Exception:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadSubjectAttendance();
  }, [user, toast]);

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 60) return 'text-green-600 dark:text-green-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getAttendanceIcon = (percentage: number) => {
    if (percentage >= 60) return <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />;
    if (percentage >= 50) return <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
    return <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Subject-wise Attendance
        </h1>
        <p className="text-muted-foreground">
          Track your attendance for each subject
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <Card className="neumorphic">
          <CardContent className="pt-6 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No subject attendance data available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject, index) => (
            <Card key={index} className="neumorphic hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getAttendanceIcon(subject.attendancePercentage)}
                  </div>

                  {/* Subject Name and Progress */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <h3 className="font-semibold text-base truncate">
                        {subject.subjectName}
                      </h3>
                      <p className={`text-sm font-bold ${getAttendanceColor(subject.attendancePercentage)}`}>
                        {subject.attendancePercentage.toFixed(1)}%
                      </p>
                    </div>
                    <Progress 
                      value={subject.attendancePercentage} 
                      className="h-2"
                    />
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 text-center flex-shrink-0">
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-base font-bold">{subject.classesHeld}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Present</p>
                      <p className="text-base font-bold text-green-600 dark:text-green-400">
                        {subject.classesAttended}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Absent</p>
                      <p className="text-base font-bold text-red-600 dark:text-red-400">
                        {subject.classesAbsent}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && subjects.length > 0 && (
        <Card className="neumorphic">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-accent/50">
                <p className="text-sm text-muted-foreground mb-1">Total Subjects</p>
                <p className="text-2xl font-bold">{subjects.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-sm text-muted-foreground mb-1">Above 60%</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {subjects.filter(s => s.attendancePercentage >= 60).length}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <p className="text-sm text-muted-foreground mb-1">50-60%</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {subjects.filter(s => s.attendancePercentage >= 50 && s.attendancePercentage < 60).length}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                <p className="text-sm text-muted-foreground mb-1">Below 50%</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {subjects.filter(s => s.attendancePercentage < 50).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubjectAttendancePage;
