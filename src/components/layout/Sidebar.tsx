import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  User, 
  Bell, 
  Upload,
  GraduationCap,
  BookOpen,
  LogOut,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SidebarProps {
  isCollapsed: boolean;
  isMobile?: boolean;
  onNavigate?: () => void;
}

const Sidebar = ({ isCollapsed, isMobile = false, onNavigate }: SidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/attendance', label: 'Overall Attendance', icon: CalendarCheck },
    { to: '/subject-attendance', label: 'Subject Attendance', icon: BookOpen },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/notices', label: 'Notices', icon: Bell },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/notices', label: 'Upload Notices', icon: Upload },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className={`h-screen fixed top-0 left-0 bg-card border-r border-border neumorphic transition-all duration-300 flex flex-col overflow-hidden ${
      isCollapsed ? 'w-16 sm:w-20' : 'w-56 sm:w-64'
    }`}>
      <div className={`flex-1 flex flex-col p-3 sm:p-4 md:p-6 overflow-y-auto ${isCollapsed ? 'px-2 sm:px-3' : ''}`}>
        <div className={`flex items-center mb-4 sm:mb-6 md:mb-8 ${
          isCollapsed ? 'justify-center flex-col gap-1 sm:gap-2' : 'gap-2 sm:gap-3'
        }`}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">EduDesk</h1>
              <p className="text-xs text-muted-foreground capitalize">{user?.role || 'Portal'}</p>
            </div>
          )}
        </div>

        <nav className="space-y-1 sm:space-y-2 flex-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={handleNavClick}
              className={`flex items-center rounded-lg text-muted-foreground hover:text-foreground transition-smooth hover:bg-accent ${
                isCollapsed ? 'flex-col justify-center px-2 py-2 sm:py-3 gap-1' : 'gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3'
              }`}
              activeClassName="bg-accent text-accent-foreground font-medium shadow-sm"
              title={link.label}
            >
              <link.icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm sm:text-base">{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto space-y-1 sm:space-y-2 pt-3 sm:pt-4 border-t border-border">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className={`w-full ${isCollapsed ? 'px-2 sm:px-3' : 'gap-2'} justify-center text-xs sm:text-sm`}
                title={isCollapsed ? 'Contact Us' : undefined}
              >
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                {!isCollapsed && <span>Contact Us</span>}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Contact Us</DialogTitle>
                <DialogDescription>
                  Get in touch with us for any queries or support
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a 
                      href="mailto:mukund3734@gmail.com" 
                      className="text-sm font-medium hover:text-primary transition-colors break-all"
                    >
                      mukund3734@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <a 
                      href="tel:+919343488515" 
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      +91 93434 88515
                    </a>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="destructive"
            onClick={handleLogout}
            className={`w-full ${isCollapsed ? 'px-2 sm:px-3' : 'gap-2'} justify-center text-xs sm:text-sm`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
