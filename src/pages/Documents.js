import React, { useState } from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';

const Documents = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { data: customers, isLoading: customersLoading } = useQuery('customers', 
    async () => {
      const response = await axios.get('http://localhost:5000/api/customers');
      return response.data;
    }
  );

  const { data: documents, isLoading: documentsLoading, refetch: refetchDocuments } = useQuery(
    ['documents', selectedCustomer],
    async () => {
      if (!selectedCustomer) return [];
      const response = await axios.get(`http://localhost:5000/api/documents/${selectedCustomer}`);
      return response.data;
    }
  );

  const handleFileUpload = async (event, type) => {
    if (!selectedCustomer) {
      toast.error('Please select a customer first');
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('customerId', selectedCustomer);

    setUploading(true);
    try {
      await axios.post('http://localhost:5000/api/documents/upload', formData);
      toast.success('Document uploaded successfully');
      refetchDocuments();
    } catch (error) {
      toast.error('Failed to upload document');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  if (customersLoading) return <div>Loading customers...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Document Management</h1>
      
      {/* Customer Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Select Customer</label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          value={selectedCustomer || ''}
          onChange={(e) => setSelectedCustomer(e.target.value)}
        >
          <option value="">Select a customer</option>
          {customers?.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* Document Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-4">Driver's License</h3>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileUpload(e, 'driver_license')}
            disabled={uploading || !selectedCustomer}
          />
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-4">Passport/ID</h3>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileUpload(e, 'passport')}
            disabled={uploading || !selectedCustomer}
          />
        </div>
      </div>

      {/* Documents List */}
      {selectedCustomer && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Uploaded Documents</h2>
          {documentsLoading ? (
            <div>Loading documents...</div>
          ) : documents?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 bg-white rounded-lg shadow">
                  <p className="font-medium">{doc.type}</p>
                  <p className="text-sm text-gray-500">
                    Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                  </p>
                  <a
                    href={`http://localhost:5000${doc.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-800 text-sm"
                  >
                    View Document
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p>No documents uploaded yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Documents; 