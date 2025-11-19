import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface AttendanceLoginProps {
  onSubmit: (username: string, password: string) => void;
  loading: boolean;
  error: string | null;
}

const AttendanceLogin = ({ onSubmit, loading, error }: AttendanceLoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset validation error
    setValidationError('');
    
    // Validate input
    if (!username.trim()) {
      setValidationError('Username is required');
      return;
    }
    
    if (!password.trim()) {
      setValidationError('Password is required');
      return;
    }
    
    // Call parent's submit handler
    onSubmit(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Attendance Portal Login</CardTitle>
          <CardDescription>
            Enter your AccSoft credentials to fetch your attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || validationError) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {validationError || error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching attendance...
                </>
              ) : (
                'Fetch Attendance'
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Your credentials are not stored and are only used to fetch attendance
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceLogin;
