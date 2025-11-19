import StatCard from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Bell,
  BookOpen,
  Building2,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { adminStats } from '@/utils/dummyData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const AdminDashboard = () => {
  const departmentData = [
    { name: 'CS', students: 450 },
    { name: 'IT', students: 380 },
    { name: 'ECE', students: 420 },
    { name: 'EE', students: 350 },
    { name: 'ME', students: 380 },
    { name: 'CE', students: 276 },
  ];

  const attendanceTrend = [
    { month: 'Jan', attendance: 78 },
    { month: 'Feb', attendance: 82 },
    { month: 'Mar', attendance: 85 },
    { month: 'Apr', attendance: 80 },
    { month: 'May', attendance: 83 },
    { month: 'Jun', attendance: 82.5 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage and monitor college operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Students"
          value={adminStats.totalStudents}
          icon={Users}
          subtitle="Active enrollments"
          trend="up"
          trendValue="+5% from last month"
        />
        <StatCard
          title="Notices Uploaded"
          value={adminStats.totalNotices}
          icon={Bell}
          subtitle="This academic year"
        />
        <StatCard
          title="Active Sessions"
          value={adminStats.activeSessions}
          icon={BookOpen}
          subtitle="Ongoing classes"
        />
        <StatCard
          title="Departments"
          value={adminStats.departments}
          icon={Building2}
          subtitle="Academic departments"
        />
        <StatCard
          title="Faculty Members"
          value={adminStats.faculty}
          icon={UserCheck}
          subtitle="Teaching staff"
        />
        <StatCard
          title="Avg Attendance"
          value={`${adminStats.attendance}%`}
          icon={TrendingUp}
          subtitle="College-wide"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="neumorphic">
          <CardHeader>
            <CardTitle>Department-wise Students</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
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
                <Bar 
                  dataKey="students" 
                  fill="hsl(var(--primary))" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="neumorphic">
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="neumorphic">
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-accent/50 text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Classes Today</p>
              <p className="text-2xl font-bold">142</p>
            </div>
            <div className="p-4 rounded-lg bg-accent/50 text-center">
              <p className="text-sm text-muted-foreground mb-1">Library Members</p>
              <p className="text-2xl font-bold">1,845</p>
            </div>
            <div className="p-4 rounded-lg bg-accent/50 text-center">
              <p className="text-sm text-muted-foreground mb-1">Hostel Residents</p>
              <p className="text-2xl font-bold">1,234</p>
            </div>
            <div className="p-4 rounded-lg bg-accent/50 text-center">
              <p className="text-sm text-muted-foreground mb-1">Active Clubs</p>
              <p className="text-2xl font-bold">24</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
