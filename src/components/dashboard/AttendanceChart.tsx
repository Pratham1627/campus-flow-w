import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { weeklyAttendance } from '@/utils/dummyData';
import { AttendanceData } from '@/services/attendanceService';
import { Skeleton } from '@/components/ui/skeleton';

interface AttendanceChartProps {
  attendance: AttendanceData | null;
  loading: boolean;
}

const AttendanceChart = ({ attendance, loading }: AttendanceChartProps) => {
  if (loading) {
    return (
      <Card className="neumorphic">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Weekly Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="neumorphic">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Weekly Attendance Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={weeklyAttendance}>
            <defs>
              <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="week" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Area
              type="monotone"
              dataKey="attendance"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorAttendance)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AttendanceChart;
