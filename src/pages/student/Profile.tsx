import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Calendar, BookOpen, GraduationCap } from 'lucide-react';
import { useAttendance } from '@/hooks/useAttendance';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const Profile = () => {
  const { user } = useAuth();
  const { attendance, loading } = useAttendance();

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Student Profile
        </h1>
        <p className="text-muted-foreground">
          View and manage your profile information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="neumorphic lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="w-32 h-32">
                <AvatarFallback className="gradient-primary text-white text-4xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
                <p className="text-muted-foreground">{user?.rollNo}</p>
                <p className="text-sm text-primary font-medium mt-1">{user?.branch}</p>
              </div>
              
              <div className="w-full pt-4 border-t space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Bhopal, India</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined: Sept 2023</span>
                </div>
              </div>

              <Button className="w-full gradient-primary">
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="neumorphic lg:col-span-2">
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rollNo">Roll Number</Label>
                <Input id="rollNo" value={user?.rollNo} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input id="branch" value={user?.branch} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Current Semester</Label>
                <Input id="semester" value={user?.semester} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
                <Input id="batch" value="25-26" disabled />
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Attendance Overview
              </h3>
              
              {loading ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                </div>
              ) : attendance ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-accent/50">
                      <p className="text-sm text-muted-foreground mb-1">Total Classes</p>
                      <p className="text-2xl font-bold">{attendance.totalClasses}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/50">
                      <p className="text-sm text-muted-foreground mb-1">Present</p>
                      <p className="text-2xl font-bold text-primary">{attendance.presentClasses}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/50">
                      <p className="text-sm text-muted-foreground mb-1">Absent</p>
                      <p className="text-2xl font-bold text-destructive">{attendance.absentClasses}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Overall Attendance</span>
                      <span className="font-semibold text-primary">
                        {attendance.attendancePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={attendance.attendancePercentage} className="h-3" />
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No attendance data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
