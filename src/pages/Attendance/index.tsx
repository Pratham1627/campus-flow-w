import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import AttendanceLogin from '@/components/attendance/AttendanceLogin';
import AttendanceDisplay from '@/components/attendance/AttendanceDisplay';
import { Loader2 } from 'lucide-react';

interface AttendanceSummary {
  total_classes: string;
  present: string;
  percentage: string;
}

interface AttendanceResponse {
  ok: boolean;
  summary?: AttendanceSummary;
  error?: string;
}

const Attendance = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<AttendanceResponse>('/api/attendance', {
        username,
        password,
      });

      if (response.data.ok && response.data.summary) {
        setAttendanceData(response.data.summary);
        setError(null);
      } else {
        // Handle API error response
        const errorMessage = response.data.error || 'Failed to fetch attendance';
        setError(mapErrorMessage(errorMessage));
      }
    } catch (err) {
      // Handle network or other errors
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with error status
          const errorData = err.response.data as AttendanceResponse;
          setError(mapErrorMessage(errorData.error || 'Server error occurred'));
        } else if (err.request) {
          // Request made but no response received
          setError('Unable to connect to server. Please ensure the backend is running.');
        } else {
          // Something else happened
          setError('An unexpected error occurred. Please try again.');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const mapErrorMessage = (apiError: string): string => {
    // Map backend error messages to user-friendly messages
    const lowerError = apiError.toLowerCase();
    
    if (lowerError.includes('login failed') || lowerError.includes('invalid')) {
      return 'Invalid username or password. Please check your credentials.';
    }
    
    if (lowerError.includes('not accessible') || lowerError.includes('parentdesk')) {
      return 'AccSoft portal is currently unavailable. Please try again later.';
    }
    
    if (lowerError.includes('network') || lowerError.includes('timeout') || lowerError.includes('econnrefused')) {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    
    if (lowerError.includes('scraper error')) {
      return 'Unable to fetch attendance data. The AccSoft portal may be down or experiencing issues.';
    }
    
    // Default generic error
    return 'Something went wrong. Please try again.';
  };

  const handleFetchAgain = async () => {
    // Refetch using stored credentials
    if (user?.username && user?.password) {
      await handleLogin(user.username, user.password);
    }
  };

  const handleLogout = () => {
    // Clear all state
    setAttendanceData(null);
    setError(null);
  };

  // Auto-fetch attendance on component mount if credentials exist
  useEffect(() => {
    if (isInitialLoad && user?.username && user?.password) {
      handleLogin(user.username, user.password);
      setIsInitialLoad(false);
    }
  }, [user?.username, user?.password, isInitialLoad]);

  return (
    <div className="space-y-6">
      {loading && !attendanceData ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Fetching your attendance data...</p>
          </div>
        </div>
      ) : !attendanceData && !user?.username ? (
        <AttendanceLogin
          onSubmit={handleLogin}
          loading={loading}
          error={error}
        />
      ) : !attendanceData ? (
        <AttendanceLogin
          onSubmit={handleLogin}
          loading={loading}
          error={error}
        />
      ) : (
        <AttendanceDisplay
          summary={attendanceData}
          onFetchAgain={handleFetchAgain}
          onLogout={handleLogout}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Attendance;
