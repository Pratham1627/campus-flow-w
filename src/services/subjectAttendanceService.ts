// src/services/subjectAttendanceService.ts
import axios from 'axios';

const API_URL = import.meta.env.PROD
  ? '/api/subject-attendance'
  : 'http://localhost:5000/api/subject-attendance';

export interface SubjectAttendance {
  subjectName: string;
  shortName: string;
  classesHeld: number;
  classesAttended: number;
  classesAbsent: number;
  attendancePercentage: number;
}

export interface SubjectAttendanceResponse {
  ok: boolean;
  subjects?: SubjectAttendance[];
  error?: string;
}

export const fetchSubjectAttendance = async (
  username: string,
  password: string
): Promise<SubjectAttendanceResponse> => {
  try {
    const response = await axios.post<SubjectAttendanceResponse>(API_URL, {
      username,
      password,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching subject attendance:', error);
    return {
      ok: false,
      error: 'Failed to fetch subject attendance data',
    };
  }
};
