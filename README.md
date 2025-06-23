# 🚗 Car Financing System

A full-stack web application for managing car financing operations, built with React, Node.js, and SQLite.

## Features

### 👤 Customer Management
- Register and manage customer information
- Upload and store customer documents (Driver's ID, Passport)
- Track customer financing details
- View comprehensive customer profiles

### 💰 Payment Management
- Automatic monthly payment schedule generation
- Payment tracking and status updates
- Support for payment proof uploads
- Early close-out functionality

### 📁 Document Management
- Secure file upload system for customer documents
- Document preview functionality
- Organized storage of payment proofs

### 📊 Reports & Analytics
- Real-time financial dashboard
- Profit calculations and tracking
- Customizable report filters
- Export functionality

### 🔐 Security & Additional Features
- Admin authentication
- Data export to Excel/PDF
- Printable payment schedules
- Overdue payment alerts

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Axios for API calls
- PDF/Excel export libraries

### Backend
- Node.js with Express
- SQLite database
- Multer for file uploads
- JWT authentication
- PDF generation

## Project Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Set up environment variables:
Create `.env` files in both frontend and backend directories.

5. Initialize the database:
```bash
cd backend
npm run init-db
```

6. Start the development servers:

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

## Project Structure

```
car-financing-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.js
│   ├── public/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   ├── uploads/
│   └── package.json
└── README.md
```

## Database Schema

### Customers
- id (PRIMARY KEY)
- fullName
- phoneNumber
- driverIdPath
- passportIdPath
- creationDate
- carDetails
- purchaseCost
- leasingAmount
- monthlyInstallment
- leaseDuration
- leaseStartDate
- totalProfit

### Payments
- id (PRIMARY KEY)
- customerId (FOREIGN KEY)
- dueDate
- amount
- status
- paymentDate
- proofOfPaymentPath

### Documents
- id (PRIMARY KEY)
- customerId (FOREIGN KEY)
- type
- filePath
- uploadDate

## API Endpoints

### Customer Management
- POST /api/customers - Create new customer
- GET /api/customers - List all customers
- GET /api/customers/:id - Get customer details
- PUT /api/customers/:id - Update customer
- DELETE /api/customers/:id - Delete customer

### Payment Management
- POST /api/payments - Record new payment
- GET /api/payments/customer/:id - Get customer payments
- PUT /api/payments/:id - Update payment status
- GET /api/payments/overdue - Get overdue payments

### Document Management
- POST /api/documents/upload - Upload document
- GET /api/documents/customer/:id - Get customer documents
- DELETE /api/documents/:id - Delete document

### Reports
- GET /api/reports/summary - Get financial summary
- GET /api/reports/customers - Get customer report
- GET /api/reports/payments - Get payment report

## Contributing

[Contributing guidelines]

## License

[License information]
