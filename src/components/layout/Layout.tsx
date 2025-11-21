import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const { isAuthenticated } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleNavigation = () => {
    setIsSidebarCollapsed(true);
  };

  return (
    <div className="flex min-h-screen w-full bg-background overflow-x-hidden">
      <Sidebar isCollapsed={isSidebarCollapsed} isMobile={isMobile} onNavigate={handleNavigation} />
      <div className={`flex-1 flex flex-col w-full min-w-0 overflow-x-hidden transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-16 sm:ml-20' : 'ml-56 sm:ml-64'
      }`}>
        <Navbar onToggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
