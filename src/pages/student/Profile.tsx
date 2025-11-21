import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Calendar, BookOpen, GraduationCap, User } from 'lucide-react';
import { useAttendance } from '@/hooks/useAttendance';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { fetchProfileData, ProfileData } from '@/services/attendanceService';

const Profile = () => {
  const { user } = useAuth();
  const { attendance, loading } = useAttendance();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (user?.username && user?.password) {
        setProfileLoading(true);
        console.log('[Profile] Fetching profile for:', user.username);
        const result = await fetchProfileData(user.username, user.password);
        console.log('[Profile] API Result:', result);
        if (result.ok && result.profile) {
          console.log('[Profile] Profile data loaded:', result.profile);
          setProfileData(result.profile);
        } else {
          console.error('[Profile] Failed to load profile:', result.error);
        }
        setProfileLoading(false);
      } else {
        console.warn('[Profile] Missing username or password');
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, [user?.username, user?.password]);

  const displayName = profileData?.name || user?.name || '';
  const initials = displayName
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
            {profileLoading ? (
              <div className="flex flex-col items-center text-center space-y-4">
                <Skeleton className="w-32 h-32 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="w-32 h-32">
                  {profileData?.photoUrl ? (
                    <AvatarImage src={profileData.photoUrl} alt={displayName} />
                  ) : null}
                  <AvatarFallback className="gradient-primary text-white text-4xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
                  <p className="text-muted-foreground">{profileData?.scholarNo || user?.username}</p>
                  <p className="text-sm text-primary font-medium mt-1">
                    {profileData?.branch || user?.branch}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Semester: {profileData?.semester || user?.semester}
                  </p>
                </div>
                
                <div className="w-full pt-4 border-t space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">
                      {profileData?.email || user?.email}
                    </span>
                  </div>
                  {profileData?.mobile && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">+91 {profileData.mobile}</span>
                    </div>
                  )}
                  {profileData?.dob && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">DOB: {profileData.dob}</span>
                    </div>
                  )}
                  {profileData?.fatherName && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Father: {profileData.fatherName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="neumorphic lg:col-span-2">
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {profileLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="enrollmentNo">Enrollment Number</Label>
                    <Input id="enrollmentNo" value={profileData?.enrollmentNo || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scholarNo">Scholar Number</Label>
                    <Input id="scholarNo" value={profileData?.rollNo || user?.rollNo || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Input id="section" value={profileData?.section || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Input id="branch" value={profileData?.branch || user?.branch || ''} disabled />
                  </div>
                </div>

                {(profileData?.percentage10 || profileData?.percentage12) && (
                  <div className="pt-4 border-t space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Previous Education
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileData?.percentage10 && (
                        <div className="p-3 rounded-lg bg-accent/50 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Class 10th</p>
                          <p className="text-xl font-bold text-primary">{profileData.percentage10}%</p>
                          {profileData.board10 && (
                            <p className="text-xs text-muted-foreground">{profileData.board10} • {profileData.year10}</p>
                          )}
                        </div>
                      )}
                      {profileData?.percentage12 && (
                        <div className="p-3 rounded-lg bg-accent/50 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Class 12th</p>
                          <p className="text-xl font-bold text-primary">{profileData.percentage12}%</p>
                          {profileData.board12 && (
                            <p className="text-xs text-muted-foreground">{profileData.board12} • {profileData.year12}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

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
