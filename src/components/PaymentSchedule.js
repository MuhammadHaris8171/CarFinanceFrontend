import React from 'react';
import { format } from 'date-fns';
import { FaFileExcel, FaFilePdf, FaPrint } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const PaymentSchedule = ({ customer, payments }) => {
  if (!customer || !payments || payments.length === 0) {
    return <div className="text-center p-4">No payment data available</div>;
  }

  // Calculate total rent
  const totalRent = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  
  // Format date to display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MM/dd/yy');
  };

  // Get payment status class
  const getStatusClass = (payment) => {
    if (payment.status === 'paid') return 'text-green-600';
    if (payment.status === 'overdue') return 'text-red-600';
    return '';
  };

  // Get payment amount class
  const getAmountClass = (payment) => {
    if (payment.status === 'paid') {
      if (parseFloat(payment.amount) < customer.monthlyInstallment) {
        return 'text-red-600'; // Underpaid
      } else if (parseFloat(payment.amount) > customer.monthlyInstallment) {
        return 'text-green-600'; // Overpaid
      }
    }
    return '';
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Payment Schedule', 14, 22);
    
    // Add customer info
    doc.setFontSize(12);
    doc.text(`Customer: ${customer.fullName}`, 14, 32);
    doc.text(`Phone: ${customer.phoneNumber}`, 14, 38);
    doc.text(`Car: ${customer.carBrand} ${customer.carModel} ${customer.carYear}`, 14, 44);
    doc.text(`Lease Duration: ${customer.leaseDuration} months`, 14, 50);
    doc.text(`Monthly Payment: ₼${customer.monthlyInstallment}`, 14, 56);
    doc.text(`Total Amount: ₼${totalRent}`, 14, 62);
    
    // Add payment schedule table
    const tableData = payments.map((payment, index) => [
      index + 1,
      formatDate(payment.dueDate),
      `₼${payment.amount}`,
      payment.status === 'paid' ? `₼${payment.actualAmountPaid || payment.amount}` : '-',
      payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
      formatDate(payment.paymentDate),
      payment.status === 'paid' ? 'Yes' : 'No',
      `₼${(totalRent - payments.slice(0, index + 1).reduce((sum, p) => sum + (p.status === 'paid' ? parseFloat(p.actualAmountPaid || p.amount) : 0), 0)).toFixed(2)}`
    ]);
    
    doc.autoTable({
      startY: 70,
      head: [['#', 'Due Date', 'Amount Due', 'Amount Paid', 'Status', 'Payment Date', 'Paid', 'Balance']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    doc.save(`${customer.fullName}_payment_schedule.pdf`);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Payment Schedule'],
      ['Customer', customer.fullName],
      ['Phone', customer.phoneNumber],
      ['Car', `${customer.carBrand} ${customer.carModel} ${customer.carYear}`],
      ['Lease Duration', `${customer.leaseDuration} months`],
      ['Monthly Payment', `₼${customer.monthlyInstallment}`],
      ['Total Amount', `₼${totalRent}`],
      [],
      ['#', 'Due Date', 'Amount Due', 'Amount Paid', 'Status', 'Payment Date', 'Paid', 'Balance']
    ]);
    
    const tableData = payments.map((payment, index) => [
      index + 1,
      formatDate(payment.dueDate),
      `₼${payment.amount}`,
      payment.status === 'paid' ? `₼${payment.actualAmountPaid || payment.amount}` : '-',
      payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
      formatDate(payment.paymentDate),
      payment.status === 'paid' ? 'Yes' : 'No',
      `₼${(totalRent - payments.slice(0, index + 1).reduce((sum, p) => sum + (p.status === 'paid' ? parseFloat(p.actualAmountPaid || p.amount) : 0), 0)).toFixed(2)}`
    ]);
    
    XLSX.utils.sheet_add_aoa(worksheet, tableData, { origin: 'A9' });
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment Schedule');
    XLSX.writeFile(workbook, `${customer.fullName}_payment_schedule.xlsx`);
  };

  // Print schedule
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none print:border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Payment Schedule</h2>
        <div className="print:hidden flex space-x-2">
          <button
            onClick={handleExportExcel}
            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center text-sm"
          >
            <FaFileExcel className="mr-1" /> Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 flex items-center text-sm"
          >
            <FaFilePdf className="mr-1" /> PDF
          </button>
          <button
            onClick={handlePrint}
            className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 flex items-center text-sm"
          >
            <FaPrint className="mr-1" /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="font-semibold mb-2">Customer Information</h3>
          <p><span className="font-medium">Name:</span> {customer.fullName}</p>
          <p><span className="font-medium">Phone:</span> {customer.phoneNumber}</p>
          <p><span className="font-medium">Car:</span> {customer.carBrand} {customer.carModel} {customer.carYear}</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Lease Information</h3>
          <p><span className="font-medium">Lease Duration:</span> {customer.leaseDuration} months</p>
          <p><span className="font-medium">Monthly Payment:</span> ₼{customer.monthlyInstallment}</p>
          <p><span className="font-semibold text-lg">Total Amount:</span> <span className="font-bold text-blue-700">₼{totalRent.toFixed(2)}</span></p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-2 px-4 border text-center">#</th>
              <th className="py-2 px-4 border">Due Date</th>
              <th className="py-2 px-4 border">Amount Due</th>
              <th className="py-2 px-4 border">Amount Paid</th>
              <th className="py-2 px-4 border">Payment Date</th>
              <th className="py-2 px-4 border">Balance</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => {
              // Calculate running balance: subtract only paid payments up to this row
              const paidSoFar = payments
                .slice(0, index + 1)
                .reduce((sum, p) => sum + ((p.status === 'paid' || p.paymentDate) ? 
                  parseFloat(p.actualAmountPaid || p.amount) : 0), 0);
              const balance = totalRent - paidSoFar;

              return (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border text-center">{index + 1}</td>
                  <td className="py-2 px-4 border">{formatDate(payment.dueDate)}</td>
                  <td className="py-2 px-4 border">₼{payment.amount}</td>
                  <td className={`py-2 px-4 border ${getAmountClass(payment)}`}>
                    {payment.status === 'paid' ? 
                      `₼${payment.actualAmountPaid ? payment.actualAmountPaid : payment.amount}` : 
                      '-'}
                  </td>
                  <td className={`py-2 px-4 border ${getStatusClass(payment)}`}>{payment.paymentDate ? formatDate(payment.paymentDate) : '-'}</td>
                  <td className="py-2 px-4 border font-medium">₼{balance.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentSchedule; 