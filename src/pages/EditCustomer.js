import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import config from "../config";

export default function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${config.API_URL}/customers/${id}`, {
          withCredentials: true,
          headers: { 
            Authorization: token ? `Bearer ${token}` : undefined
          }
        });
        
        // Format date for input field (YYYY-MM-DD)
        const customer = response.data;
        const formattedDate = customer.leaseStartDate ? 
          new Date(customer.leaseStartDate).toISOString().split("T")[0] : "";
        
        setForm({
          fullName: customer.fullName || "",
          phoneNumber: customer.phoneNumber || "",
          carBrand: customer.carBrand || "",
          carModel: customer.carModel || "",
          carYear: customer.carYear || "",
          carPurchaseCost: customer.carPurchaseCost || 0,
          leasingAmount: customer.leasingAmount || 0,
          monthlyInstallment: customer.monthlyInstallment || 0,
          leaseDuration: customer.leaseDuration || 0,
          leaseStartDate: formattedDate
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching customer:", error);
        toast.error("Failed to load customer data");
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Safely append only defined form fields
      const fieldsToSend = [
        'fullName', 'phoneNumber', 'carBrand', 'carModel', 'carYear',
        'carPurchaseCost', 'leasingAmount', 'monthlyInstallment', 
        'leaseDuration', 'leaseStartDate'
      ];
      
      fieldsToSend.forEach(field => {
        if (form[field] !== undefined && form[field] !== null && form[field] !== '') {
          // Convert numbers to strings explicitly
          if (typeof form[field] === 'number') {
            formData.append(field, form[field].toString());
          } else {
            formData.append(field, form[field]);
          }
        }
      });
      
      // Handle file uploads
      if (form.driverId && typeof form.driverId === 'object') {
        formData.append('driverId', form.driverId);
      }
      if (form.passport && typeof form.passport === 'object') {
        formData.append('passport', form.passport);
      }
      if (form.photo && typeof form.photo === 'object') {
        formData.append('photo', form.photo);
      }

      // Add this for debugging
      console.log('Form data keys:', [...formData.keys()]);
      
      const token = localStorage.getItem('token');
      // Create headers object without Content-Type to let browser set it automatically
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      await axios.put(`${config.API_URL}/customers/${id}`, formData, {
        withCredentials: true,
        headers
      });
      
      toast.success('Customer updated successfully');
      navigate('/customers');
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center p-5">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!form) return <div className="p-5">Customer not found</div>;

  return (
    <div className="p-5 w-full">
      <h1 className="text-2xl font-bold mb-6">Edit Customer</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded shadow">
        <div className="form-group">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input 
            id="fullName"
            name="fullName" 
            placeholder="Full Name" 
            value={form.fullName} 
            onChange={handleChange} 
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input 
            id="phoneNumber"
            name="phoneNumber" 
            placeholder="Phone Number" 
            value={form.phoneNumber} 
            onChange={handleChange} 
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>

        <div className="form-group">
          <label htmlFor="carBrand" className="block text-sm font-medium text-gray-700 mb-1">Car Brand</label>
          <input 
            id="carBrand"
            name="carBrand" 
            placeholder="Car Brand" 
            value={form.carBrand} 
            onChange={handleChange} 
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="carModel" className="block text-sm font-medium text-gray-700 mb-1">Car Model</label>
          <input 
            id="carModel"
            name="carModel" 
            placeholder="Car Model" 
            value={form.carModel} 
            onChange={handleChange} 
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="carYear" className="block text-sm font-medium text-gray-700 mb-1">Car Year</label>
          <input 
            id="carYear"
            type="number" 
            name="carYear" 
            placeholder="Car Year" 
            value={form.carYear} 
            onChange={handleChange} 
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="carPurchaseCost" className="block text-sm font-medium text-gray-700 mb-1">Car Purchase Cost (₼)</label>
        <input
            id="carPurchaseCost"
          type="number"
            name="carPurchaseCost"
          placeholder="Car Purchase Cost (₼)"
            value={form.carPurchaseCost}
          onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        </div>

        <div className="form-group">
          <label htmlFor="leasingAmount" className="block text-sm font-medium text-gray-700 mb-1">Leasing Amount (₼)</label>
        <input
            id="leasingAmount"
          type="number"
          name="leasingAmount"
          placeholder="Leasing Amount (₼)"
          value={form.leasingAmount}
          onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        </div>
        
        <div className="form-group">
          <label htmlFor="monthlyInstallment" className="block text-sm font-medium text-gray-700 mb-1">Monthly Installment (₼)</label>
        <input
            id="monthlyInstallment"
          type="number"
            name="monthlyInstallment"
          placeholder="Monthly Installment (₼)"
            value={form.monthlyInstallment}
          onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        </div>

        <div className="form-group">
          <label htmlFor="leaseDuration" className="block text-sm font-medium text-gray-700 mb-1">Lease Duration (Months)</label>
        <input
            id="leaseDuration"
          type="number"
            name="leaseDuration"
          placeholder="Lease Duration (Months)"
            value={form.leaseDuration}
          onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        </div>
        
        <div className="form-group">
          <label htmlFor="leaseStartDate" className="block text-sm font-medium text-gray-700 mb-1">Lease Start Date</label>
        <input
            id="leaseStartDate"
          type="date"
            name="leaseStartDate"
            value={form.leaseStartDate}
          onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        </div>

        <div className="md:col-span-2 flex justify-end mt-4">
          <button 
            type="submit" 
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}