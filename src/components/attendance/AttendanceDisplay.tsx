import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, LogOut, BookOpen, CheckCircle, TrendingUp } from 'lucide-react';

interface AttendanceSummary {
  total_classes: string;
  present: string;
  percentage: string;
}

interface AttendanceDisplayProps {
  summary: AttendanceSummary;
  onFetchAgain: () => void;
  onLogout: () => void;
  loading: boolean;
}

const AttendanceDisplay = ({ summary, onFetchAgain, onLogout, loading }: AttendanceDisplayProps) => {
  // Parse the attendance data
  const parseValue = (text: string): string => {
    const match = text.match(/:\s*(.+)/);
    return match ? match[1].trim() : text;
  };

  const totalClasses = parseValue(summary.total_classes);
  const present = parseValue(summary.present);
  const percentageText = parseValue(summary.percentage);
  const percentage = parseFloat(percentageText.replace('%', '').trim()) || 0;

  // Determine color based on percentage
  const getColorClass = () => {
    if (percentage >= 60) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = () => {
    if (percentage >= 60) return 'bg-green-600';
    if (percentage >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getStatusMessage = () => {
    if (percentage >= 60) return 'Excellent! Keep it up! 🎉';
    if (percentage >= 50) return 'Good, but try to improve 📚';
    return 'Warning: Below minimum requirement ⚠️';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Your Attendance
          </h1>
          <p className="text-muted-foreground">
            Real-time attendance fetched from AccSoft portal
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onFetchAgain}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="neumorphic">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Total Classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClasses}</div>
          </CardContent>
        </Card>

        <Card className="neumorphic">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Classes Attended
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{present}</div>
          </CardContent>
        </Card>

        <Card className="neumorphic">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Attendance Percentage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getColorClass()}`}>
              {percentageText}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="neumorphic">
        <CardHeader>
          <CardTitle>Attendance Overview</CardTitle>
          <CardDescription>{getStatusMessage()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your Progress</span>
              <span className={`font-semibold ${getColorClass()}`}>
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="relative">
              <Progress value={percentage} className="h-4" />
              <div 
                className={`absolute inset-0 h-4 rounded-full ${getProgressColor()} transition-all`}
                style={{ 
                  width: `${Math.min(percentage, 100)}%`,
                  opacity: 0.9 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="text-red-600">50%</span>
              <span className="text-green-600">60%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="p-4 rounded-lg bg-accent/50">
              <div className="text-sm text-muted-foreground mb-1">
                Total Classes Conducted
              </div>
              <div className="text-2xl font-bold">{totalClasses}</div>
            </div>
            <div className="p-4 rounded-lg bg-accent/50">
              <div className="text-sm text-muted-foreground mb-1">
                Classes You Attended
              </div>
              <div className="text-2xl font-bold text-green-600">{present}</div>
            </div>
          </div>

          {percentage < 60 && (
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                💡 Tip: You need to maintain at least 60% attendance to meet the minimum requirement.
              </p>
            </div>
          )}

          {percentage < 50 && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                ⚠️ Warning: Your attendance is below 50%. This may affect your eligibility for exams.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceDisplay;
