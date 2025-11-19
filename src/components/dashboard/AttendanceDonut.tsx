import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AttendanceData } from '@/services/attendanceService';
import { Skeleton } from '@/components/ui/skeleton';

interface AttendanceDonutProps {
  attendance: AttendanceData | null;
  loading: boolean;
}

const AttendanceDonut = ({ attendance, loading }: AttendanceDonutProps) => {
  if (loading) {
    return (
      <Card className="neumorphic">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Attendance Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!attendance) {
    return (
      <Card className="neumorphic">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Attendance Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No attendance data available</p>
        </CardContent>
      </Card>
    );
  }

  const data = [
    { name: 'Present', value: attendance.presentClasses },
    { name: 'Absent', value: attendance.absentClasses },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))'];

  return (
    <Card className="neumorphic">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Attendance Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center mt-4">
          <p className="text-3xl font-bold text-primary">
            {attendance.attendancePercentage.toFixed(1)}%
          </p>
          <p className="text-sm text-muted-foreground">Overall Attendance</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceDonut;
