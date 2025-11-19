import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchRealAttendance, AttendanceData, ProfileData } from '@/services/attendanceService';
import { useToast } from '@/hooks/use-toast';

export function useAttendance() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAttendance = async () => {
    if (!user?.username || !user?.password) {
      setError('Login credentials not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetchRealAttendance(user.username, user.password);
      
      if (response.ok && response.data) {
        setAttendance(response.data);
        
        // Update user profile with fetched data
        if (response.profile) {
          console.log('Profile data received from API:', response.profile);
          
          const updatedProfile = {
            name: response.profile.name || user.name,
            rollNo: response.profile.rollNo || response.profile.enrollmentNo || user.rollNo,
            branch: response.profile.branch || user.branch,
            semester: response.profile.semester || user.semester,
            email: response.profile.email || user.email,
          };
          
          console.log('Updating user profile with:', updatedProfile);
          updateUser(updatedProfile);
        } else {
          console.log('No profile data in response');
        }
      } else {
        setError(response.error || 'Failed to fetch attendance');
        toast({
          title: 'Error',
          description: response.error || 'Failed to fetch attendance',
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch attendance';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.username && user?.password && user?.role === 'student') {
      loadAttendance();
    }
  }, [user?.username, user?.password]);

  return { attendance, loading, error, refetch: loadAttendance };
}
