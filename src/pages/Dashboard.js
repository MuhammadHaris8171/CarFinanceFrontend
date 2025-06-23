import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaCar, FaMoneyBillWave, FaExclamationTriangle, FaPlusCircle, FaListAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import config from '../config';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeLeases: 0,
    monthlyPayments: 0,
    overduePayments: 0,
    totalInvested: 0,
    totalCollected: 0,
    totalProfit: 0,
    totalUnpaid: 0,
    fullyPaidCustomers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [overduePaymentsData, setOverduePaymentsData] = useState([]);
  const [correctProfit, setCorrectProfit] = useState(0);

  useEffect(() => {
    fetchDashboardStats();
    fetchOverduePayments();
    calculateCorrectProfit();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(false);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.get(`${config.API_URL}/reports/dashboard`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Ensure all stats have valid values
      const validatedStats = {
        totalCustomers: parseInt(response.data.totalCustomers) || 0,
        activeLeases: parseInt(response.data.activeLeases) || 0,
        monthlyPayments: parseFloat(response.data.monthlyPayments) || 0,
        overduePayments: parseInt(response.data.overduePayments) || 0,
        totalInvested: parseFloat(response.data.totalInvested) || 0,
        totalCollected: parseFloat(response.data.totalCollected) || 0,
        totalProfit: parseFloat(response.data.totalProfit) || 0,
        totalUnpaid: parseFloat(response.data.totalUnpaid) || 0,
        fullyPaidCustomers: parseInt(response.data.fullyPaidCustomers) || 0
      };
      
      setStats(validatedStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverduePayments = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.get(`${config.API_URL}/payments`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Identify overdue payments (pending with past due date)
      const today = new Date();
      const overdue = response.data.filter(payment => {
        const dueDate = new Date(payment.dueDate);
        return payment.status === 'pending' && dueDate < today;
      });
      
      setOverduePaymentsData(overdue);
      
      // Update stats with correct count
      setStats(prevStats => ({
        ...prevStats,
        overduePayments: overdue.length
      }));
      
    } catch (error) {
      console.error('Error fetching overdue payments:', error);
    }
  };

  const calculateCorrectProfit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Get all customers to calculate profit correctly
      const response = await axios.get(`${config.API_URL}/customers`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      let totalProfit = 0;
      
      // Calculate profit for each customer using the formula: monthly × duration - leasing
      response.data.forEach(customer => {
        const monthlyPayment = parseFloat(customer.monthlyInstallment) || 0;
        const leaseDuration = parseInt(customer.leaseDuration) || 0;
        const leasingAmount = parseFloat(customer.leasingAmount) || 0;
        
        const customerProfit = (monthlyPayment * leaseDuration) - leasingAmount;
        totalProfit += customerProfit;
      });
      
      // Update profit calculation
      setCorrectProfit(totalProfit);
      setStats(prevStats => ({
        ...prevStats,
        totalProfit: totalProfit
      }));
      
      // Update the server with the correct profit calculation
      await axios.post(
        `${config.API_URL}/reports/update-profit`,
        { totalProfit: totalProfit },
        { 
          headers: { 'Authorization': `Bearer ${token}` }
        }
      ).catch(err => console.error("Error updating profit:", err));
      
    } catch (error) {
      console.error('Error calculating profit:', error);
    }
  };

  // Format number safely
  const formatNumber = (value) => {
    if (value === undefined || value === null || isNaN(value)) return '0';
    return parseFloat(value).toLocaleString();
  };

  // Retry loading
  const handleRetry = () => {
    fetchDashboardStats();
    fetchOverduePayments();
    calculateCorrectProfit();
  };

  // Prepare financial chart data
  const financialData = {
    labels: ['Invested', 'Collected', 'Profit', 'Unpaid'],
    datasets: [
      {
        label: 'Financial Overview (₼)',
        data: [
          stats.totalInvested,
          stats.totalCollected,
          correctProfit || stats.totalProfit,
          stats.totalUnpaid
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64">
        <p className="text-red-600 mb-4">Failed to load dashboard statistics</p>
        <button 
          onClick={handleRetry}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Total Customers</p>
              <p className="text-2xl font-bold">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <FaCar className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Active Leases</p>
              <p className="text-2xl font-bold">{stats.activeLeases}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaMoneyBillWave className="text-yellow-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Monthly Payments</p>
              <p className="text-2xl font-bold">₼{formatNumber(stats.monthlyPayments)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <FaExclamationTriangle className="text-red-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Overdue Payments</p>
              <p className="text-2xl font-bold">{overduePaymentsData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview and Customer Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Invested</span>
              <span className="font-semibold">₼{formatNumber(stats.totalInvested)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Collected</span>
              <span className="font-semibold">₼{formatNumber(stats.totalCollected)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Profit</span>
              <span className={`font-semibold ${correctProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₼{formatNumber(correctProfit || stats.totalProfit)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Unpaid</span>
              <span className="font-semibold text-red-600">₼{formatNumber(stats.totalUnpaid)}</span>
            </div>
            <div className="mt-4 h-40">
              <Bar 
                data={financialData} 
                options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '₼' + value;
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Customers</span>
              <span className="font-semibold">{stats.totalCustomers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Leases</span>
              <span className="font-semibold text-blue-600">{stats.activeLeases}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Fully Paid</span>
              <span className="font-semibold text-green-600">{stats.fullyPaidCustomers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overdue</span>
              <span className="font-semibold text-red-600">{overduePaymentsData.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/customers/add"
            className="flex items-center justify-center p-4 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <FaPlusCircle className="mr-2" />
            Add New Customer
          </Link>
          <Link
            to="/payments"
            className="flex items-center justify-center p-4 bg-green-50 rounded-lg text-green-600 hover:bg-green-100 transition-colors"
          >
            <FaMoneyBillWave className="mr-2" />
            Record Payment
          </Link>
          <Link
            to="/reports"
            className="flex items-center justify-center p-4 bg-purple-50 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors"
          >
            <FaListAlt className="mr-2" />
            View Reports
          </Link>
        </div>
      </div>
    </div>
  );
}
