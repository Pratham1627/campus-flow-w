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
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    <aside className={`h-screen sticky top-0 bg-card border-r border-border neumorphic transition-all duration-300 flex flex-col ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      <div className={`flex-1 flex flex-col p-6 ${isCollapsed ? 'px-3' : ''}`}>
        <div className={`flex items-center mb-8 ${
          isCollapsed ? 'justify-center flex-col gap-2' : 'gap-3'
        }`}>
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-foreground">EduDesk</h1>
              <p className="text-xs text-muted-foreground capitalize">{user?.role || 'Portal'}</p>
            </div>
          )}
        </div>

        <nav className="space-y-2 flex-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={`flex items-center rounded-lg text-muted-foreground hover:text-foreground transition-smooth hover:bg-accent ${
                isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'
              }`}
              activeClassName="bg-accent text-accent-foreground font-medium shadow-sm"
              title={isCollapsed ? link.label : undefined}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto space-y-2 pt-4 border-t border-border">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className={`w-full ${isCollapsed ? 'px-3' : 'gap-2'} justify-center`}
                title={isCollapsed ? 'Contact Us' : undefined}
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
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
            className={`w-full ${isCollapsed ? 'px-3' : 'gap-2'} justify-center`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
