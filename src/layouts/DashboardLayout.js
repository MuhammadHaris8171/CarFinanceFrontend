import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUsers, FaMoneyBillWave, FaChartBar, FaUserCircle, FaBars, FaTimes, FaHome } from 'react-icons/fa';

const DashboardLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isMobileView, setIsMobileView] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', checkMobile);
    checkMobile();
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getActiveClass = (path) => {
    return location.pathname === path || (path === '/dashboard' && location.pathname === '/') 
      ? 'bg-blue-50 text-blue-600 font-medium'
      : '';
  };

  const menuItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/customers', icon: <FaUsers />, label: 'Customers' },
    { path: '/payments', icon: <FaMoneyBillWave />, label: 'Payments' },
    { path: '/reports', icon: <FaChartBar />, label: 'Reports' },
    { path: '/profile', icon: <FaUserCircle />, label: 'Profile' },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center">
        <button 
          onClick={toggleSidebar} 
          className="text-gray-500 focus:outline-none"
        >
          <FaBars size={24} />
        </button>
        <Link to="/dashboard" className="text-xl font-bold text-blue-600">Car Finance</Link>
        <div className="w-6"></div>
      </header>

      {/* Sidebar - Mobile: Absolute positioned with overlay, Desktop: Fixed position */}
      <div 
        className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          transform transition-transform duration-300 ease-in-out
          fixed md:relative z-30 md:z-auto w-64 md:w-64 h-full bg-white shadow-lg
          md:translate-x-0
        `}
      >
        <div className="p-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-2xl font-bold text-blue-600">Car Finance</Link>
          {isMobileView && (
            <button onClick={toggleSidebar} className="md:hidden text-gray-500">
              <FaTimes size={24} />
            </button>
          )}
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 ${getActiveClass(item.path)}`}
              onClick={() => isMobileView && setIsSidebarOpen(false)}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="w-full flex items-center px-6 py-3 mt-6 text-gray-600 hover:bg-red-50 hover:text-red-600"
          >
            <span className="mr-3">🚪</span>
            Logout
          </button>
        </nav>
      </div>

      {/* Backdrop overlay for mobile */}
      {isMobileView && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="hidden md:block bg-white shadow">
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {location.pathname === '/dashboard' || location.pathname === '/' ? 'Dashboard' :
               location.pathname.startsWith('/customers') ? 'Customers' :
               location.pathname === '/payments' ? 'Payments' :
               location.pathname === '/reports' ? 'Reports' :
               location.pathname === '/profile' ? 'Profile' : 'Dashboard'}
            </h2>
          </div>
        </header>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 