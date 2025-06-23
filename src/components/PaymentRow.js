import { useState, useEffect } from "react";
import FilePreview from "./FilePreview";
import axios from 'axios';
import toast from 'react-hot-toast';
import config from '../config';
import { FaEye, FaCheck, FaFileUpload, FaExchangeAlt, FaUndo } from 'react-icons/fa';

export default function PaymentRow({ payment, index, onPaymentUpdate }) {
  const [proofFile, setProofFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [markedPaid, setMarkedPaid] = useState(payment.status === "paid");
  const [paymentStatus, setPaymentStatus] = useState(payment.status);
  const [loading, setLoading] = useState(false);
  const [showProof, setShowProof] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmNotes, setConfirmNotes] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [actualAmount, setActualAmount] = useState(payment.amount);
  const [showDifferentAmount, setShowDifferentAmount] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if payment is overdue
  useEffect(() => {
    if (payment.status === "pending") {
      const today = new Date();
      const dueDate = new Date(payment.dueDate);
      if (dueDate < today) {
        setPaymentStatus("overdue");
      } else {
        setPaymentStatus("pending");
      }
    } else {
      setPaymentStatus(payment.status);
    }
  }, [payment]);

  const handleUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setProofFile(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleMarkPaid = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('paymentDate', paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString());
      
      // Add actual amount if it's different
      if (showDifferentAmount && actualAmount !== payment.amount) {
        formData.append('actualAmount', actualAmount.toString());
        formData.append('notes', `Customer paid ${actualAmount} instead of ${payment.amount}`);
      }
      
      if (uploadedFile) {
        formData.append('proof', uploadedFile);
      }
      
      const token = localStorage.getItem('token');
      // Create headers object without Content-Type to let browser set it automatically
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.post(`${config.API_URL}/payments/${payment.id}/pay`, formData, {
        withCredentials: true,
        headers
      });
      
      setMarkedPaid(true);
      setPaymentStatus("paid");
      
      // Show appropriate message for overpayments
      if (response.data.overpayment > 0) {
        toast.success(`Payment marked as paid with ₼${response.data.overpayment} extra. Your next payment will be reduced by this amount.`);
      } else {
        toast.success('Payment marked as paid');
      }
      
      if (onPaymentUpdate) {
        onPaymentUpdate();
      }
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      toast.error('Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  const handleRevertStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const data = {
        notes: confirmNotes || `Status changed from ${markedPaid ? 'paid to pending' : 'pending to paid'}`
      };

      await axios.post(`${config.API_URL}/payments/${payment.id}/revert`, data, {
        withCredentials: true,
        headers: { 
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      
      // Toggle the status
      const newPaidStatus = !markedPaid;
      setMarkedPaid(newPaidStatus);
      setPaymentStatus(newPaidStatus ? "paid" : isOverdue() ? "overdue" : "pending");
      toast.success(`Payment ${markedPaid ? 'marked as unpaid' : 'marked as paid'}`);
      setShowConfirm(false);
      setConfirmNotes('');
      
      // Call the callback to refresh payments data
      if (onPaymentUpdate) {
        onPaymentUpdate();
      }
    } catch (error) {
      console.error('Error reverting payment status:', error);
      toast.error('Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = () => {
    const today = new Date();
    const dueDate = new Date(payment.dueDate);
    return dueDate < today;
  };

  const getStatusClass = () => {
    if (paymentStatus === "paid") return "bg-green-500";
    if (paymentStatus === "overdue") return "bg-red-500";
    return "bg-yellow-500";
  };

  const getStatusText = () => {
    if (paymentStatus === "paid") return "Paid";
    if (paymentStatus === "overdue") return "Overdue";
    return "Pending";
  };

  const toggleProofView = () => {
    setShowProof(!showProof);
  };

  const toggleDifferentAmount = () => {
    setShowDifferentAmount(!showDifferentAmount);
  };

  // Enhanced date formatting function with debug
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      // Removed debug log to reduce console noise
      // console.log('Raw date value:', dateString);
      
      // Create a new date object
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return "-";
      }
      
      // Format the date
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return "-";
    }
  };

  return (
    <>
      <tr className="border-b hover:bg-gray-50">
        <td className="py-2 px-6">{index + 1}</td>
        <td className="py-2 px-6">{formatDate(payment.dueDate)}</td>
        <td className="py-2 px-6">
          ₼{payment.amount}
          {payment.status === "paid" && payment.actualAmountPaid && payment.actualAmountPaid !== payment.amount && (
            <span className="ml-1 text-xs text-gray-500">(Paid: ₼{payment.actualAmountPaid})</span>
          )}
        </td>
        <td className="py-2 px-6">
          <span
            className={`px-2 py-1 rounded text-white text-xs ${getStatusClass()}`}
          >
            {getStatusText()}
          </span>
          <button 
            onClick={() => setShowConfirm(true)}
            className="ml-2 text-gray-500 hover:text-gray-700"
            title={`Mark as ${markedPaid ? 'Unpaid' : 'Paid'}`}
          >
            <FaUndo size={14} />
          </button>
        </td>
        <td className="py-2 px-6">
          {markedPaid && payment.paymentDate ? 
            formatDate(payment.paymentDate) : 
            "-"}
        </td>
        <td className="py-2 px-6">
          {(proofFile || payment.proofOfPaymentPath) ? (
            <button 
              onClick={toggleProofView} 
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <FaEye className="mr-1" /> View
            </button>
          ) : (
            "-"
          )}
        </td>
        <td className="py-2 px-6">
          {!markedPaid ? (
            <div className="flex flex-col">
              <div className="flex items-center mb-2">
                <label className="flex items-center cursor-pointer bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200">
                  <FaFileUpload className="mr-1" />
                  <span>Upload Proof</span>
                  <input type="file" onChange={handleUpload} className="hidden" />
                </label>
              </div>
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="border rounded px-2 py-1 text-xs"
                  max={new Date().toISOString().slice(0, 10)}
                />
              </div>
              
              <div className="mb-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showDifferentAmount}
                    onChange={toggleDifferentAmount}
                    className="mr-1"
                  />
                  <span className="text-xs">Different amount paid?</span>
                </label>
              </div>
              
              {showDifferentAmount && (
                <div className="mb-2">
                  <label className="block text-xs text-gray-500 mb-1">Actual Amount Paid</label>
                  <input
                    type="number"
                    value={actualAmount}
                    onChange={e => setActualAmount(e.target.value)}
                    className="border rounded px-2 py-1 text-xs"
                    min="0"
                    step="0.01"
                  />
                  {parseFloat(actualAmount) > parseFloat(payment.amount) && (
                    <div className="text-xs text-green-600 mt-1">
                      Overpayment: ₼{(parseFloat(actualAmount) - parseFloat(payment.amount)).toFixed(2)}
                      <br/>
                      <span className="italic">This will reduce your next payment amount</span>
                    </div>
                  )}
                </div>
              )}
              
              {proofFile && (
                <div className="text-xs text-green-600 mb-2">File selected</div>
              )}
              <button
                onClick={handleMarkPaid}
                disabled={loading}
                className={`flex items-center justify-center bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <FaCheck className="mr-1" /> Mark as Paid
                  </>
                )}
              </button>
            </div>
          ) : (
            <span className="text-green-600 flex items-center">
              <FaCheck className="mr-1" /> Completed
            </span>
          )}
        </td>
      </tr>
      
      {/* Proof Modal - Full screen on mobile */}
      {showProof && (
        <tr className="bg-gray-50">
          <td colSpan="7" className="p-4">
            <div className={`flex flex-col items-center ${isMobile ? 'fixed inset-0 bg-white z-50 pt-12' : ''}`}>
              <h4 className="text-lg font-medium mb-2">Proof of Payment</h4>
              <div className={`border rounded-lg p-2 bg-white ${isMobile ? 'w-full max-w-full px-4' : ''}`}>
                <FilePreview 
                  fileUrl={proofFile || (payment.proofOfPaymentPath ? `${config.API_URL.replace('/api', '')}${payment.proofOfPaymentPath}` : null)} 
                />
              </div>
              <button 
                onClick={toggleProofView}
                className={`mt-2 text-gray-600 hover:text-gray-800 ${isMobile ? 'py-2 px-4 bg-gray-200 rounded-md w-full max-w-xs' : ''}`}
              >
                Close
              </button>
            </div>
          </td>
        </tr>
      )}

      {/* Confirmation Modal - Full screen on mobile */}
      {showConfirm && (
        <tr className="bg-gray-50">
          <td colSpan="7" className="p-4">
            <div className={`bg-white shadow-md rounded p-4 mx-auto ${isMobile ? 'fixed inset-0 z-50 overflow-auto' : 'max-w-md'}`}>
              <h4 className="text-lg font-medium mb-2 text-center">
                Confirm Status Change
              </h4>
              <p className="mb-4 text-center">
                Are you sure you want to mark this payment as {markedPaid ? "Unpaid" : "Paid"}?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add a note (optional)
                </label>
                <textarea
                  value={confirmNotes}
                  onChange={(e) => setConfirmNotes(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Reason for changing status..."
                  rows="2"
                ></textarea>
              </div>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevertStatus}
                  disabled={loading}
                  className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <FaExchangeAlt className="mr-2" />
                  {loading ? "Processing..." : "Confirm Change"}
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
} 