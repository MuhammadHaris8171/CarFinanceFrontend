import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import toast from 'react-hot-toast';
import config from '../config';

export default function AddCustomer() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    car: "",
    leasingAmount: "",
    monthlyAmount: "",
    leaseMonths: "",
    leaseStart: "",
    driverId: null,
    passport: null,
    photo: null,
  });
  
  const [previews, setPreviews] = useState({
    driverId: null,
    passport: null,
    photo: null,
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
      
      // Create preview for image files
      if (files[0] && files[0].type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => ({ ...prev, [name]: reader.result }));
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const formData = new FormData();
    formData.append('fullName', form.name);
    formData.append('phoneNumber', form.phone);
    formData.append('car', form.car);
    formData.append('leasingAmount', form.leasingAmount.toString());
    formData.append('monthlyInstallment', form.monthlyAmount.toString());
    formData.append('leaseDuration', form.leaseMonths.toString());
    formData.append('leaseStartDate', form.leaseStart);
    if (form.driverId) formData.append('driverId', form.driverId);
    if (form.passport) formData.append('passport', form.passport);
    if (form.photo) formData.append('photo', form.photo);
  
    // Add debugging log
    console.log('Form data keys:', [...formData.keys()]);
    
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      // Do NOT set Content-Type - let browser set multipart/form-data automatically
      
      await axios.post(`${config.API_URL}/customers`, formData, {
        withCredentials: true,
        headers
      });
      toast.success('Customer added successfully!');
      navigate('/customers');
    } catch (error) {
      toast.error('Failed to add customer: ' + (error.response?.data?.message || error.message));
      console.error('Error adding customer:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 overflow-y-auto py-10 px-4 w-full">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8 w-full">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-2">Add New Customer</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              name="name"
              placeholder="John Doe"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              name="phone"
              placeholder="+994..."
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Car Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Car (Brand / Model / Year)</label>
            <input
              name="car"
              placeholder="Toyota Prius 2021"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Leasing Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leasing Amount (₼)</label>
            <input
              type="number"
              name="leasingAmount"
              onChange={handleChange}
              placeholder="e.g. 10000"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Monthly Installment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Installment (₼)</label>
            <input
              type="number"
              name="monthlyAmount"
              onChange={handleChange}
              placeholder="e.g. 500"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Lease Months */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lease Duration (Months)</label>
            <input
              type="number"
              name="leaseMonths"
              onChange={handleChange}
              placeholder="e.g. 24"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Lease Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lease Start Date</label>
            <input
              type="date"
              name="leaseStart"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Customer Photo Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Photo</label>
            <div className="flex flex-col items-center">
              <input
                type="file"
                name="photo"
                onChange={handleChange}
                className="w-full mb-2"
                accept="image/*"
              />
              {previews.photo && (
                <div className="mt-2 border rounded-md p-2">
                  <img 
                    src={previews.photo} 
                    alt="Customer preview" 
                    className="h-40 object-contain mx-auto"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Driver's ID Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driver's ID (Image)</label>
            <input
              type="file"
              name="driverId"
              onChange={handleChange}
              className="w-full mb-2"
              accept="image/*"
            />
            {previews.driverId && (
              <div className="mt-2 border rounded-md p-2">
                <img 
                  src={previews.driverId} 
                  alt="Driver ID preview" 
                  className="h-40 object-contain mx-auto"
                />
              </div>
            )}
          </div>

          {/* Passport Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passport / ID Photo</label>
            <input
              type="file"
              name="passport"
              onChange={handleChange}
              className="w-full mb-2"
              accept="image/*"
            />
            {previews.passport && (
              <div className="mt-2 border rounded-md p-2">
                <img 
                  src={previews.passport} 
                  alt="Passport preview" 
                  className="h-40 object-contain mx-auto"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
