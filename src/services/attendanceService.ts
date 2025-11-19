import { supabase } from '@/integrations/supabase/client';

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
    const { data, error } = await supabase.functions.invoke('scrape-attendance', {
      body: { username, password },
    });

    if (error) {
      console.error('Error calling scrape-attendance function:', error);
      return { ok: false, error: error.message };
    }

    return data as AttendanceResponse;
  } catch (error) {
    console.error('Error fetching real attendance:', error);
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch attendance' 
    };
  }
}
