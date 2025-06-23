import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaEye, FaSearch, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import config from '../config';

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchCustomers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/customers`, {
        params: { search, status: filter !== 'all' ? filter : undefined },
        withCredentials: true,
        headers: { 
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${config.API_URL}/customers/${id}`, {
        withCredentials: true,
        headers: { 
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    }
  };

  // Export to Excel function
  const exportToExcel = () => {
    try {
      // Format data for export
      const exportData = customers.map(customer => ({
        'Full Name': customer.fullName,
        'Phone Number': customer.phoneNumber,
        'Car': `${customer.carBrand} ${customer.carModel} ${customer.carYear}`,
        'Purchase Cost': customer.carPurchaseCost,
        'Leasing Amount': customer.leasingAmount,
        'Monthly Payment': customer.monthlyInstallment,
        'Lease Duration': customer.leaseDuration,
        'Start Date': new Date(customer.leaseStartDate).toLocaleDateString(),
        'Status': customer.status
      }));
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
      
      // Generate file name with date
      const fileName = `car_finance_customers_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Export file
      XLSX.writeFile(workbook, fileName);
      
      toast.success('Exported to Excel successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  // Export to PDF function
  const exportToPDF = () => {
    // This would typically use a PDF library like jsPDF
    // For now we'll just show a toast notification
    toast('PDF export functionality coming soon', {
      icon: 'ℹ️',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Customers</h1>
        <div className="flex space-x-2">
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
            title="Export to Excel"
          >
            <FaFileExcel className="mr-2" /> Excel
          </button>
          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
            title="Export to PDF"
          >
            <FaFilePdf className="mr-2" /> PDF
          </button>
          <button
            onClick={() => navigate("/customers/add")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
          >
            <span className="mr-2">+</span> Add Customer
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Customers</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Car Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Financial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {customer.photoUrl && (
                        <div className="flex-shrink-0 h-10 w-10 mr-4">
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={`${config.API_URL.replace('/api', '')}${customer.photoUrl}`} 
                            alt={customer.fullName} 
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {customer.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.phoneNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {customer.carBrand} {customer.carModel}
                    </div>
                    <div className="text-sm text-gray-500">
                      Year: {customer.carYear}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Leasing: ₼{customer.leasingAmount}
                    </div>
                    <div className="text-sm text-gray-500">
                      Monthly: ₼{customer.monthlyInstallment}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${customer.status === 'active' ? 'bg-green-100 text-green-800' : 
                        customer.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/customers/${customer.id}`)}
                      className="text-blue-600 hover:text-blue-900 mx-2"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => navigate(`/customers/edit/${customer.id}`)}
                      className="text-green-600 hover:text-green-900 mx-2"
                      title="Edit Customer"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="text-red-600 hover:text-red-900 mx-2"
                      title="Delete Customer"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {customers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No customers found
          </div>
        )}
      </div>
    </div>
  );
}
