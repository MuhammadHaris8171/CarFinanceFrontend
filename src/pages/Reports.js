import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFileExcel, FaFilePdf, FaUsers, FaCar, FaMoneyBill, FaExclamationTriangle } from 'react-icons/fa';
import config from '../config';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Reports = () => {
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
  const [carBrandData, setCarBrandData] = useState([]);
  const [monthlyPaymentData, setMonthlyPaymentData] = useState([]);
  const [overduePaymentsData, setOverduePaymentsData] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchCarBrandData();
    fetchMonthlyPaymentData();
    fetchOverduePayments();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/reports/dashboard`, {
        withCredentials: true,
        headers: { 
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      
      // Make sure the data is processed as numbers
      const data = {
        ...response.data,
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
      
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchCarBrandData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/reports/car-brands`, {
        withCredentials: true,
        headers: { 
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      setCarBrandData(response.data);
    } catch (error) {
      console.error('Error fetching car brand data:', error);
      toast.error('Failed to load car brand statistics');
    }
  };

  const fetchMonthlyPaymentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/reports/monthly`, {
        withCredentials: true,
        headers: { 
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      setMonthlyPaymentData(response.data);
    } catch (error) {
      console.error('Error fetching monthly payment data:', error);
      toast.error('Failed to load monthly payment statistics');
    }
  };
  
  const fetchOverduePayments = async () => {
    try {
      const token = localStorage.getItem('token');
      // Get all payments to process overdue status on the front end
      const response = await axios.get(`${config.API_URL}/payments`, {
        withCredentials: true,
        headers: { 
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      
      // Process overdue payments (pending payments with a due date in the past)
      const today = new Date();
      const overduePayments = response.data.filter(payment => {
        const dueDate = new Date(payment.dueDate);
        return payment.status === 'pending' && dueDate < today;
      });
      
      setOverduePaymentsData(overduePayments);
      
      // Update stats with correct overduePayments number
      setStats(prevStats => ({
        ...prevStats,
        overduePayments: overduePayments.length
      }));
      
    } catch (error) {
      console.error('Error fetching overdue payments:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/reports/export/customers/excel`, {
        responseType: 'blob',
        withCredentials: true,
        headers: { 
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'customers.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Customer list exported successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export customer list');
    }
  };

  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/reports/export/payments/pdf`, {
        responseType: 'blob',
        withCredentials: true,
        headers: { 
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'payment_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Payment report exported successfully');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export payment report');
    }
  };

  // Calculate total overdue amount
  const totalOverdueAmount = overduePaymentsData.reduce((sum, payment) => 
    sum + parseFloat(payment.amount || 0), 0);

  // Prepare chart data
  const customerStatusData = {
    labels: ['Active', 'Completed', 'Overdue'],
    datasets: [
      {
        label: 'Customer Status',
        data: [stats.activeLeases, stats.fullyPaidCustomers, overduePaymentsData.length],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const financialData = {
    labels: ['Invested', 'Collected', 'Profit', 'Unpaid', 'Overdue'],
    datasets: [
      {
        label: 'Financial Overview (₼)',
        data: [
          stats.totalInvested, 
          stats.totalCollected, 
          stats.totalProfit, 
          stats.totalUnpaid,
          totalOverdueAmount
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 0, 0, 0.6)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 0, 0, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const carBrandChartData = {
    labels: carBrandData.map(item => item.car_brand || 'Unknown'),
    datasets: [
      {
        label: 'Number of Cars',
        data: carBrandData.map(item => item.total_cars),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  // Monthly payment data chart
  const monthlyPaymentChartData = {
    labels: monthlyPaymentData.map(item => item.period || ''),
    datasets: [
      {
        label: 'Collected Amount (₼)',
        data: monthlyPaymentData.map(item => item.collected_amount || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Overdue Amount (₼)',
        data: monthlyPaymentData.map(item => item.overdue_amount || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Reports Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FaUsers className="text-blue-500 text-3xl mr-4" />
            <div>
              <h3 className="font-semibold text-lg text-gray-600">Total Customers</h3>
              <p className="text-2xl font-bold">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FaCar className="text-green-500 text-3xl mr-4" />
            <div>
              <h3 className="font-semibold text-lg text-gray-600">Active Leases</h3>
              <p className="text-2xl font-bold">{stats.activeLeases}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FaMoneyBill className="text-yellow-500 text-3xl mr-4" />
            <div>
              <h3 className="font-semibold text-lg text-gray-600">Monthly Payments</h3>
              <p className="text-2xl font-bold">₼{stats.monthlyPayments.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 text-3xl mr-4" />
            <div>
              <h3 className="font-semibold text-lg text-gray-600">Overdue Payments</h3>
              <p className="text-2xl font-bold">{overduePaymentsData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button 
          onClick={handleExportExcel}
          className="flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md"
        >
          <FaFileExcel className="mr-2" /> Export Customer List (Excel)
        </button>
        <button 
          onClick={handleExportPDF}
          className="flex items-center bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-md"
        >
          <FaFilePdf className="mr-2" /> Export Payment Report (PDF)
        </button>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Customer Status</h3>
          <div className="h-80">
            <Pie data={customerStatusData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Financial Overview</h3>
          <div className="h-80">
            <Bar 
              data={financialData} 
              options={{ 
                maintainAspectRatio: false,
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Car Brand Distribution</h3>
          <div className="h-80">
            <Bar 
              data={carBrandChartData} 
              options={{ 
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Monthly Payment Overview</h3>
          <div className="h-80">
            <Bar 
              data={monthlyPaymentChartData} 
              options={{ 
                maintainAspectRatio: false,
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
    </div>
  );
};

export default Reports;
 