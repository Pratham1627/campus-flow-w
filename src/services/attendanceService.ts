import axios from 'axios';

export interface AttendanceData {
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  attendancePercentage: number;
  requiredFor75: number;
  allowedUntil60: number;
}

export interface AttendanceResponse {
  ok: boolean;
  data?: AttendanceData;
  error?: string;
}

export async function fetchRealAttendance(
  username: string,
  password: string
): Promise<AttendanceResponse> {
  try {
    const response = await axios.post('/api/attendance', {
      username,
      password,
    });

    if (response.data.ok && response.data.summary) {
      // Parse the backend response and convert to AttendanceData format
      const { total_classes, present, percentage } = response.data.summary;
      
      // Extract numeric values
      const totalClasses = parseInt(total_classes.replace(/\D/g, '')) || 0;
      const presentClasses = parseInt(present.replace(/\D/g, '')) || 0;
      const attendancePercentage = parseFloat(percentage.replace(/[^\d.]/g, '')) || 0;
      const absentClasses = totalClasses - presentClasses;
      
      // Calculate required classes for 75%
      const requiredFor75 = Math.max(0, Math.ceil((0.75 * totalClasses - presentClasses) / 0.25));
      
      // Calculate how many classes can be missed to stay above 60%
      const allowedUntil60 = Math.max(0, Math.floor((presentClasses - 0.6 * totalClasses) / 0.6));

      return {
        ok: true,
        data: {
          totalClasses,
          presentClasses,
          absentClasses,
          attendancePercentage,
          requiredFor75,
          allowedUntil60,
        },
      };
    } else {
      return {
        ok: false,
        error: response.data.error || 'Failed to fetch attendance',
      };
    }
  } catch (error) {
    console.error('Error fetching real attendance:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return {
          ok: false,
          error: error.response.data?.error || 'Server error occurred',
        };
      } else if (error.request) {
        return {
          ok: false,
          error: 'Unable to connect to server. Please ensure the backend is running.',
        };
      }
    }
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch attendance' 
    };
  }
}
