import StatCard from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  TrendingUp,
  TrendingDown,
  Target,
  RefreshCw,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { useAttendance } from '@/hooks/useAttendance';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Attendance = () => {
  const { attendance, loading, error, refetch } = useAttendance();

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'hsl(var(--primary))';
    if (percentage >= 60) return 'hsl(45, 93%, 47%)';
    return 'hsl(var(--destructive))';
  };

  // Calculate classes needed to reach a target percentage
  const calculateRequiredClasses = (current: number, total: number, target: number) => {
    // (current + x) / (total + x) = target/100
    // (current + x) * 100 = target * (total + x)
    // current * 100 + x * 100 = target * total + target * x
    // x * 100 - target * x = target * total - current * 100
    // x * (100 - target) = target * total - current * 100
    // x = (target * total - current * 100) / (100 - target)
    if (target >= 100) return 0;
    const required = Math.ceil((target * total - current * 100) / (100 - target));
    return Math.max(0, required);
  };

  // Calculate classes that can be missed to maintain target
  const calculateMissableClasses = (current: number, total: number, target: number) => {
    // (current / (total + x)) = target/100
    // x = (current * 100 - target * total) / target
    const missable = Math.floor((current * 100 - target * total) / target);
    return Math.max(0, missable);
  };

  // Predict attendance if trend continues until Dec 7
  const predictAttendance = (current: number, total: number) => {
    const today = new Date();
    const sessionEnd = new Date('2025-12-07');
    const daysRemaining = Math.ceil((sessionEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Classes per week: Mon(5), Tue(5), Wed(5+7=12), Thu(7), Fri(0), Sat(0), Sun(0) = 34 classes/week
    // Actually: Mon(5), Tue(5), Wed(12), Thu(7) = 29 classes/week on 4 days
    const weekdaySchedule = {
      1: 5,  // Monday
      2: 5,  // Tuesday
      3: 12, // Wednesday
      4: 7,  // Thursday
      5: 0,  // Friday
      6: 0,  // Saturday
      0: 0   // Sunday
    };

    let predictedClasses = 0;
    const currentDate = new Date(today);
    
    for (let i = 0; i < daysRemaining; i++) {
      const dayOfWeek = currentDate.getDay();
      predictedClasses += weekdaySchedule[dayOfWeek as keyof typeof weekdaySchedule] || 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate current attendance rate
    const currentRate = total > 0 ? current / total : 0;
    const predictedPresent = Math.round(predictedClasses * currentRate);
    const finalTotal = total + predictedClasses;
    const finalPresent = current + predictedPresent;
    const finalPercentage = finalTotal > 0 ? (finalPresent / finalTotal) * 100 : 0;

    return {
      daysRemaining,
      predictedClasses,
      predictedPresent,
      finalTotal,
      finalPresent,
      finalPercentage
    };
  };

  const currentPercentage = attendance?.attendancePercentage || 0;
  const prediction = attendance ? predictAttendance(attendance.presentClasses, attendance.totalClasses) : null;
  
  // Smart calculation based on current attendance
  let card60Data, card75Data;
  
  if (attendance) {
    if (currentPercentage < 60) {
      // Below 60%: Show classes needed to reach both 60% and 75%
      card60Data = {
        value: calculateRequiredClasses(attendance.presentClasses, attendance.totalClasses, 60),
        label: 'To reach 60%',
        sublabel: 'classes to attend',
        color: 'red',
        icon: TrendingUp
      };
      card75Data = {
        value: calculateRequiredClasses(attendance.presentClasses, attendance.totalClasses, 75),
        label: 'To reach 75%',
        sublabel: 'classes to attend',
        color: 'red',
        icon: TrendingUp
      };
    } else if (currentPercentage >= 60 && currentPercentage < 75) {
      // Between 60-75%: Show missable for 60%, needed for 75%
      card60Data = {
        value: calculateMissableClasses(attendance.presentClasses, attendance.totalClasses, 60),
        label: 'Maintain 60%',
        sublabel: 'classes can be missed',
        color: 'green',
        icon: TrendingDown
      };
      card75Data = {
        value: calculateRequiredClasses(attendance.presentClasses, attendance.totalClasses, 75),
        label: 'To reach 75%',
        sublabel: 'classes to attend',
        color: 'yellow',
        icon: TrendingUp
      };
    } else {
      // Above 75%: Show missable for both 75% and 60%
      card60Data = {
        value: calculateMissableClasses(attendance.presentClasses, attendance.totalClasses, 60),
        label: 'Maintain 60%',
        sublabel: 'classes can be missed',
        color: 'green',
        icon: TrendingDown
      };
      card75Data = {
        value: calculateMissableClasses(attendance.presentClasses, attendance.totalClasses, 75),
        label: 'Maintain 75%',
        sublabel: 'classes can be missed',
        color: 'blue',
        icon: TrendingDown
      };
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Overall Attendance
          </h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading attendance data...' : error ? 'Using cached data' : 'Detailed view of your overall attendance records'}
          </p>
        </div>
        {attendance && (
          <Button onClick={refetch} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="neumorphic">
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : attendance ? (
          <>
            <StatCard
              title="Classes Attended"
              value={attendance.presentClasses}
              icon={CheckCircle}
              subtitle={`Out of ${attendance.totalClasses} classes`}
            />
            <StatCard
              title="Classes Missed"
              value={attendance.absentClasses}
              icon={XCircle}
              subtitle="Total absent"
            />
            <StatCard
              title="Current Percentage"
              value={`${attendance.attendancePercentage.toFixed(1)}%`}
              icon={BookOpen}
              trend={attendance.attendancePercentage >= 75 ? 'up' : 'down'}
            />
          </>
        ) : (
          <div className="col-span-3 text-center text-muted-foreground">
            {error || 'No attendance data available'}
          </div>
        )}
      </div>

      {/* Prediction & Analysis Cards */}
      {!loading && attendance && card60Data && card75Data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="neumorphic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Attendance Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${
                  card60Data.color === 'red' 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                    : card60Data.color === 'yellow'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <card60Data.icon className={`w-4 h-4 ${
                      card60Data.color === 'red' 
                        ? 'text-red-600 dark:text-red-400' 
                        : card60Data.color === 'yellow'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-green-600 dark:text-green-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      card60Data.color === 'red' 
                        ? 'text-red-700 dark:text-red-300' 
                        : card60Data.color === 'yellow'
                        ? 'text-yellow-700 dark:text-yellow-300'
                        : 'text-green-700 dark:text-green-300'
                    }`}>{card60Data.label}</p>
                  </div>
                  <p className={`text-3xl font-bold ${
                    card60Data.color === 'red' 
                      ? 'text-red-600 dark:text-red-400' 
                      : card60Data.color === 'yellow'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {card60Data.value}
                  </p>
                  <p className={`text-xs mt-1 ${
                    card60Data.color === 'red' 
                      ? 'text-red-600/70 dark:text-red-400/70' 
                      : card60Data.color === 'yellow'
                      ? 'text-yellow-600/70 dark:text-yellow-400/70'
                      : 'text-green-600/70 dark:text-green-400/70'
                  }`}>
                    {card60Data.sublabel}
                  </p>
                </div>

                <div className={`p-4 rounded-lg border ${
                  card75Data.color === 'red' 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                    : card75Data.color === 'yellow'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <card75Data.icon className={`w-4 h-4 ${
                      card75Data.color === 'red' 
                        ? 'text-red-600 dark:text-red-400' 
                        : card75Data.color === 'yellow'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      card75Data.color === 'red' 
                        ? 'text-red-700 dark:text-red-300' 
                        : card75Data.color === 'yellow'
                        ? 'text-yellow-700 dark:text-yellow-300'
                        : 'text-blue-700 dark:text-blue-300'
                    }`}>{card75Data.label}</p>
                  </div>
                  <p className={`text-3xl font-bold ${
                    card75Data.color === 'red' 
                      ? 'text-red-600 dark:text-red-400' 
                      : card75Data.color === 'yellow'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    {card75Data.value}
                  </p>
                  <p className={`text-xs mt-1 ${
                    card75Data.color === 'red' 
                      ? 'text-red-600/70 dark:text-red-400/70' 
                      : card75Data.color === 'yellow'
                      ? 'text-yellow-600/70 dark:text-yellow-400/70'
                      : 'text-blue-600/70 dark:text-blue-400/70'
                  }`}>
                    {card75Data.sublabel}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>Current Status:</strong> {currentPercentage.toFixed(1)}% attendance
                  {currentPercentage < 60 && ' - Below minimum threshold'}
                  {currentPercentage >= 60 && currentPercentage < 75 && ' - Above minimum, below target'}
                  {currentPercentage >= 75 && ' - Above target, well done!'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="neumorphic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Attendance Prediction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {prediction && (
                <>
                  <div className="p-4 rounded-lg bg-accent/50">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground">Predicted by Dec 7, 2025</p>
                      <p className="text-sm font-medium">{prediction.daysRemaining} days left</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold" style={{ color: getAttendanceColor(prediction.finalPercentage) }}>
                        {prediction.finalPercentage.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Final Attendance</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-accent/30">
                      <p className="text-xs text-muted-foreground">Upcoming Classes</p>
                      <p className="text-xl font-bold text-foreground">{prediction.predictedClasses}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/30">
                      <p className="text-xs text-muted-foreground">Expected Present</p>
                      <p className="text-xl font-bold text-primary">{prediction.predictedPresent}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/30">
                      <p className="text-xs text-muted-foreground">Final Total</p>
                      <p className="text-xl font-bold text-foreground">{prediction.finalTotal}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/30">
                      <p className="text-xs text-muted-foreground">Final Present</p>
                      <p className="text-xl font-bold text-primary">{prediction.finalPresent}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Based on schedule: Mon(5), Tue(5), Wed(12), Thu(7) classes per week. Prediction assumes current attendance rate continues.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Attendance;
