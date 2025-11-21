import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, LogIn, Lock, User, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserRole>('student');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password || !userType) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    // Store credentials in AuthContext for attendance fetching
    login(userType, {
      name: 'Loading...',
      email: `${username}@college.edu`,
      username: username,
      password: password,
      rollNo: 'Loading...',
      branch: 'Loading...',
      semester: 'Loading...',
    });

    toast({
      title: 'Login Successful',
      description: `Welcome back, ${username}!`,
    });

    if (userType === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-400 dark:bg-gray-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-300 dark:bg-gray-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gray-600 dark:bg-gray-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Cards Container - 2 cards visible */}
      <div className="w-full max-w-5xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-stretch">
          {/* Card 1 - Welcome/Logo */}
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 rounded-3xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 md:p-10 text-center space-y-4 sm:space-y-6 flex flex-col justify-center h-full">
              <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 mx-auto animate-float">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                    <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full animate-bounce"></div>
                  <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-400 rounded-full animate-bounce animation-delay-2000"></div>
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  EduDesk
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base md:text-lg">
                  Your complete academic companion
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Track attendance • View grades • Stay updated
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 2 - Login Form */}
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 rounded-3xl overflow-hidden">
            <CardHeader className="pb-2 pt-4 sm:pt-6">
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center">
                Log in
              </CardTitle>
              <CardDescription className="text-center text-xs text-gray-600 dark:text-gray-400">
                By logging in, you agree to our{' '}
                <span className="text-blue-600 dark:text-blue-400 font-medium">Terms of Use</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
              <form onSubmit={handleLogin} className="space-y-2.5 sm:space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="username" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-9 sm:h-10 text-sm rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your AccSoft username
                  </p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-9 sm:h-10 text-sm rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="userType" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    User Type
                  </Label>
                  <Select value={userType || ''} onValueChange={(value) => setUserType(value as UserRole)}>
                    <SelectTrigger id="userType" className="h-9 sm:h-10 text-sm rounded-xl border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          Student
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Admin
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-10 sm:h-11 text-sm sm:text-base font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-3 sm:mt-4"
                >
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Sign In
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
