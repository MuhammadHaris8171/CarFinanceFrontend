import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUsers, FaMoneyBill, FaChartBar, FaFileAlt, FaCog, FaBars, FaTimes, FaHome } from 'react-icons/fa';

const Sidebar = ({ isMobile }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(!isMobile);

  // Handle window resize and update sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize on component mount
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-blue-800 text-white"
        onClick={toggleSidebar}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>
      
      {/* Sidebar */}
      <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} transform transition-transform duration-300 ease-in-out bg-blue-800 text-white fixed md:static w-64 min-h-screen p-4 z-20`}>
        <div className="text-2xl font-bold mb-8 flex justify-between items-center">
          <span>Car Finance</span>
          <button 
            className="md:hidden text-white"
            onClick={toggleSidebar}
          >
            <FaTimes size={20} />
          </button>
        </div>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 p-2 rounded hover:bg-blue-700 ${isActive('/dashboard') || isActive('/')}`}
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <FaHome />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/customers"
                className={`flex items-center space-x-2 p-2 rounded hover:bg-blue-700 ${isActive('/customers')}`}
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <FaUsers />
                <span>Customers</span>
              </Link>
            </li>
            <li>
              <Link
                to="/payments"
                className={`flex items-center space-x-2 p-2 rounded hover:bg-blue-700 ${isActive('/payments')}`}
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <FaMoneyBill />
                <span>Payments</span>
              </Link>
            </li>
            <li>
              <Link
                to="/reports"
                className={`flex items-center space-x-2 p-2 rounded hover:bg-blue-700 ${isActive('/reports')}`}
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <FaChartBar />
                <span>Reports</span>
              </Link>
            </li>
            <li>
              <Link
                to="/documents"
                className={`flex items-center space-x-2 p-2 rounded hover:bg-blue-700 ${isActive('/documents')}`}
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <FaFileAlt />
                <span>Documents</span>
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className={`flex items-center space-x-2 p-2 rounded hover:bg-blue-700 ${isActive('/settings')}`}
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              >
                <FaCog />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Overlay for mobile */}
      {isOpen && window.innerWidth < 768 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
