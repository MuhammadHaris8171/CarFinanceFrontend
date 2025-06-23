import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from 'react-query';
import { useState, useEffect } from "react";
import axios from 'axios';
import FilePreview from "../components/FilePreview";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PaymentRow from "../components/PaymentRow";
import PaymentSchedule from "../components/PaymentSchedule";
import config from '../config';

// Import placeholder images
import img1 from '../assets/placeholder-id.png';
import img2 from '../assets/placeholder-passport.png';

const handleExportPDF = (customer, payments) => {
  if (!customer || !payments) return;
  
  const doc = new jsPDF();
  
  // Add customer details
  doc.setFontSize(20);
  doc.text('Customer Details', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Name: ${customer.fullName}`, 20, 40);
  doc.text(`Phone: ${customer.phoneNumber}`, 20, 50);
  doc.text(`Car: ${customer.carBrand} ${customer.carModel} ${customer.carYear}`, 20, 60);
  doc.text(`Purchase Cost: ₼${customer.carPurchaseCost}`, 20, 70);
  doc.text(`Leasing Amount: ₼${customer.leasingAmount}`, 20, 80);
  doc.text(`Monthly Payment: ₼${customer.monthlyInstallment}`, 20, 90);
  
  // Add payment schedule
  doc.setFontSize(16);
  doc.text('Payment Schedule', 20, 110);

  const tableData = payments.map(payment => [
    format(new Date(payment.dueDate), 'dd/MM/yyyy'),
    `₼${payment.amount}`,
    payment.status,
    payment.paymentDate ? format(new Date(payment.paymentDate), 'dd/MM/yyyy') : '-'
  ]);
  
  doc.autoTable({
    startY: 120,
    head: [['Due Date', 'Amount', 'Status', 'Payment Date']],
    body: tableData,
  });
  
  doc.save(`${customer.fullName}_details.pdf`);
  toast.success('PDF exported successfully');
};

const handleExportExcel = (customer, payments) => {
  if (!customer || !payments) return;
  
  const workbook = XLSX.utils.book_new();
  
  // Customer Details Sheet
  const customerData = [
    ['Customer Details'],
    ['Name', customer.fullName],
    ['Phone', customer.phoneNumber],
    ['Car', `${customer.carBrand} ${customer.carModel} ${customer.carYear}`],
    ['Purchase Cost', customer.carPurchaseCost],
    ['Leasing Amount', customer.leasingAmount],
    ['Monthly Payment', customer.monthlyInstallment],
    ['Lease Duration', customer.leaseDuration],
    ['Total Profit', customer.totalProfit]
];

  const customerSheet = XLSX.utils.aoa_to_sheet(customerData);
  XLSX.utils.book_append_sheet(workbook, customerSheet, 'Customer Details');
  
  // Payments Sheet
  const paymentsData = payments.map(payment => ({
    'Due Date': format(new Date(payment.dueDate), 'dd/MM/yyyy'),
    'Amount': payment.amount,
    'Status': payment.status,
    'Payment Date': payment.paymentDate ? format(new Date(payment.paymentDate), 'dd/MM/yyyy') : '-'
  }));

  const paymentsSheet = XLSX.utils.json_to_sheet(paymentsData);
  XLSX.utils.book_append_sheet(workbook, paymentsSheet, 'Payments');
  
  // Save file
  XLSX.writeFile(workbook, `${customer.fullName}_details.xlsx`);
  toast.success('Excel file exported successfully');
};

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'schedule'
  const [calculatedProfit, setCalculatedProfit] = useState(0);

  // Fetch customer data
  const { data: customer, isLoading: customerLoading, error: customerError } = useQuery(
    ['customer', id],
    async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/customers/${id}`, {
        withCredentials: true,
        headers: { 
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      return response.data;
    }
  );

  // Fetch payments data
  const { data: payments, isLoading: paymentsLoading, error: paymentsError } = useQuery(
    ['payments', id],
    async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/payments/customer/${id}`, {
        withCredentials: true,
        headers: { 
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      return response.data;
    }
  );

  // Calculate correct profit
  useEffect(() => {
    if (customer) {
      try {
        // Ensure values are properly parsed as numbers
        const monthlyPayment = parseFloat(customer.monthlyInstallment) || 0;
        const leaseDuration = parseInt(customer.leaseDuration) || 0;
        const leasingAmount = parseFloat(customer.leasingAmount) || 0;
        
        // Calculate total profit: monthly payment × duration - leasing amount
        const totalIncome = monthlyPayment * leaseDuration;
        const profit = totalIncome - leasingAmount;
        
        console.log(`Profit calculation: ${monthlyPayment} × ${leaseDuration} - ${leasingAmount} = ${profit}`);
        setCalculatedProfit(profit);
        
        // Update customer data on the server with correct profit calculation
        const token = localStorage.getItem('token');
        axios.put(`${config.API_URL}/customers/${id}`, 
          { 
            totalProfit: profit 
          },
          {
            withCredentials: true,
            headers: { Authorization: token ? `Bearer ${token}` : undefined }
          }
        ).catch(err => {
          console.error('Error updating customer profit:', err);
        });
      } catch (error) {
        console.error('Error calculating profit:', error);
        setCalculatedProfit(0);
      }
    }
  }, [customer, id]);

  return (
    <div className="p-4 md:p-6 print:p-4 print:text-black">
      {/* Loading state */}
      {(customerLoading || paymentsLoading) && (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error state */}
      {(customerError || paymentsError) && (
        <div className="flex items-center justify-center h-screen text-red-600">
          <p>Error loading data. Please try again later.</p>
        </div>
      )}

      {/* No data state */}
      {!customerLoading && !paymentsLoading && (!customer || !payments) && (
        <div className="flex items-center justify-center h-screen text-gray-600">
          <p>No customer data found.</p>
        </div>
      )}

      {/* Data loaded successfully */}
      {customer && payments && (
        <>
          {/* Top Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 print:hidden">
            <h1 className="text-xl sm:text-2xl font-bold">Customer Details</h1>
            <button
              onClick={() => navigate("/customers")}
              className="text-blue-600 underline text-sm sm:text-base"
            >
              ← Back to List
            </button>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 md:p-6 rounded shadow print:shadow-none print:bg-white print:border print:border-gray-300 print:p-4 mb-8">
            <div>
              <h2 className="text-lg font-semibold mb-2">Basic Info</h2>
              <p><strong>Name:</strong> {customer.fullName}</p>
              <p><strong>Phone:</strong> {customer.phoneNumber}</p>
              <p><strong>Lease Start:</strong> {format(new Date(customer.leaseStartDate), 'dd/MM/yyyy')}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Car & Finance</h2>
              <p><strong>Car:</strong> {customer.carBrand} {customer.carModel} {customer.carYear}</p>
              <p><strong>Leasing Amount:</strong> ₼{customer.leasingAmount}</p>
              <p>
                <strong>Monthly Payment:</strong> ₼{customer.monthlyInstallment} ×{" "}
                {customer.leaseDuration} months
              </p>
              <p>
                <strong>Total Profit:</strong> ₼{calculatedProfit.toFixed(0)}
              </p>
            </div>

            {/* Responsive File Preview */}
            <div className="col-span-1">
              <FilePreview label="Driver's ID" fileUrl={customer.driverIdPath ? `${config.API_URL.replace('/api', '')}${customer.driverIdPath}` : img1} />
            </div>
            <div className="col-span-1">
              <FilePreview label="Passport / ID" fileUrl={customer.passportIdPath ? `${config.API_URL.replace('/api', '')}${customer.passportIdPath}` : img2} />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex justify-between items-center mb-4 print:hidden">
            <h2 className="text-lg sm:text-xl font-bold">Payment Information</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md text-sm ${
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Payment List
              </button>
              <button
                onClick={() => setViewMode('schedule')}
                className={`px-4 py-2 rounded-md text-sm ${
                  viewMode === 'schedule' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Payment Schedule
              </button>
            </div>
          </div>

          {/* Payment Views */}
          {viewMode === 'table' ? (
            <>
              {/* Print/Export Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 print:hidden">
                <h2 className="text-lg sm:text-xl font-bold">Payment List</h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => window.print()}
                    className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-black"
                  >
                    🖨️ Print
                  </button>
                  <button
                    onClick={() => handleExportPDF(customer, payments)}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                  >
                    📄 Export PDF
                  </button>
                  <button
                    onClick={() => handleExportExcel(customer, payments)}
                    className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                  >
                    📊 Export Excel
                  </button>
                </div>
              </div>

              {/* Payment Table */}
              <div className="overflow-x-auto bg-white rounded shadow print:shadow-none print:border print:border-gray-300">
                <table className="min-w-full text-sm print:w-full print:border-collapse">
                  <thead className="bg-gray-100 text-gray-600 uppercase">
                    <tr>
                      <th className="py-3 px-4 text-left">#</th>
                      <th className="py-3 px-4 text-left">Due Date</th>
                      <th className="py-3 px-4 text-left">Amount (₼)</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Payment Date</th>
                      <th className="py-3 px-4 text-left">Proof</th>
                      <th className="py-3 px-4 text-left print:hidden">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {payments.map((payment, index) => (
                      <PaymentRow 
                        key={payment.id} 
                        payment={payment} 
                        index={index} 
                        onPaymentUpdate={() => {
                          // Refetch payments after update
                          queryClient.invalidateQueries(['payments', id]);
                        }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <PaymentSchedule customer={customer} payments={payments} />
          )}
        </>
      )}
    </div>
  );
}