import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Moon, Sun, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchProfileData } from '@/services/attendanceService';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

const Navbar = ({ onToggleSidebar, isSidebarCollapsed }: NavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    const loadProfilePhoto = async () => {
      if (user?.username && user?.password) {
        const result = await fetchProfileData(user.username, user.password);
        if (result.ok && result.profile?.photoUrl) {
          setProfilePhotoUrl(result.profile.photoUrl);
        }
      }
    };
    loadProfilePhoto();
  }, [user?.username, user?.password]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <nav className="h-14 sm:h-16 border-b border-border bg-card neumorphic px-3 sm:px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="rounded-lg flex-shrink-0"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        
        <div className="min-w-0 flex-1">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-foreground truncate">
            {user?.name}
          </h2>
          <p className="text-xs text-muted-foreground capitalize hidden sm:block">
            {user?.role} Portal
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                {profilePhotoUrl && (
                  <AvatarImage src={profilePhotoUrl} alt={user?.name} />
                )}
                <AvatarFallback className="gradient-primary text-white font-semibold text-xs sm:text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 sm:w-56 bg-popover" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-xs sm:text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                <p className="text-xs text-primary capitalize font-medium">
                  {user?.role}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
              <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
