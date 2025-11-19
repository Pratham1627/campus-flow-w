import StatCard from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  TrendingUp,
  TrendingDown,
  Target,
  RefreshCw
} from 'lucide-react';
import { subjectWiseAttendance } from '@/utils/dummyData';
import { useAttendance } from '@/hooks/useAttendance';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Progress } from '@/components/ui/progress';

const Attendance = () => {
  const { attendance, loading, error, refetch } = useAttendance();

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'hsl(var(--primary))';
    if (percentage >= 60) return 'hsl(45, 93%, 47%)';
    return 'hsl(var(--destructive))';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Attendance Analytics
          </h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading attendance data...' : error ? 'Using cached data' : 'Detailed view of your attendance records'}
          </p>
        </div>
        {attendance && (
          <Button onClick={refetch} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <>
            {[...Array(3)].map((_, i) => (
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
              title="Classes Attended"
              value={attendance.presentClasses}
              icon={CheckCircle}
              subtitle={`Out of ${attendance.totalClasses} classes`}
            />
            <StatCard
              title="Classes Missed"
              value={attendance.absentClasses}
              icon={XCircle}
              subtitle="Total absent"
            />
            <StatCard
              title="Current Percentage"
              value={`${attendance.attendancePercentage.toFixed(1)}%`}
              icon={BookOpen}
              trend={attendance.attendancePercentage >= 75 ? 'up' : 'down'}
            />
          </>
        ) : (
          <div className="col-span-3 text-center text-muted-foreground">
            {error || 'No attendance data available'}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="neumorphic">
          <CardHeader>
            <CardTitle>Attendance Gauge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : attendance ? (
              <div className="relative pt-8">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-primary">
                    {attendance.attendancePercentage.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Current Attendance</p>
                </div>
                <Progress 
                  value={attendance.attendancePercentage} 
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>0%</span>
                  <span className="text-destructive">60%</span>
                  <span className="text-primary">75%</span>
                  <span>100%</span>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No data available</p>
            )}
            
            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : attendance ? (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Need for 75%</p>
                      <p className="text-xs text-muted-foreground">Attend more classes</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {attendance.requiredFor75}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Can skip until 60%</p>
                      <p className="text-xs text-muted-foreground">Leaves available</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-500">
                    {attendance.allowedUntil60}
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="neumorphic">
          <CardHeader>
            <CardTitle>Subject-wise Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={subjectWiseAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="subject" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                  {subjectWiseAttendance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getAttendanceColor(entry.percentage)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="neumorphic">
        <CardHeader>
          <CardTitle>Detailed Subject-wise Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead className="text-center">Present</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Percentage</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjectWiseAttendance.map((subject) => (
                <TableRow key={subject.subject}>
                  <TableCell className="font-medium">{subject.subject}</TableCell>
                  <TableCell className="text-center">{subject.present}</TableCell>
                  <TableCell className="text-center">{subject.total}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className="font-semibold"
                      style={{ color: getAttendanceColor(subject.percentage) }}
                    >
                      {subject.percentage.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {subject.percentage >= 75 ? (
                      <span className="text-primary flex items-center justify-center gap-1">
                        <Target className="w-4 h-4" />
                        Good
                      </span>
                    ) : subject.percentage >= 60 ? (
                      <span className="text-yellow-600 flex items-center justify-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Improve
                      </span>
                    ) : (
                      <span className="text-destructive flex items-center justify-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Low
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
