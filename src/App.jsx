import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute, AdminRoute, PublicOnlyRoute } from './components/common/ProtectedRoutes';

// Auth pages
import Login from './Pages/auth/Login';
import Register from './Pages/auth/Register';
import ChangePassword from './Pages/auth/ChangePassword';
import Profile from './Pages/auth/Profile'; 

// Public pages
import Simulator from './Pages/public/Simulator';

// Admin pages
import AdminDashboard from './Pages/admin/AdminDashboard';
import AdminLoans from './Pages/admin/AdminLoans';
import RegisterClient from './Pages/admin/RegisterClient';
import CreateLoan from './Pages/admin/CreateLoan';
import Clients from './Pages/admin/Clients';
import PaymentHistory from './Pages/admin/PaymentHistory'; // NUEVO
// Client pages
import MyLoans from './Pages/client/MyLoans';
import RequestLoan from './Pages/client/RequestLoan';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>


        <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        {/* Simulator — solo autenticados */}
        <Route path="/simulator" element={<PrivateRoute><Simulator /></PrivateRoute>} />

        {/* Auth routes - only for non-authenticated */}
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

        {/* Protected - any authenticated user */}
        <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/loans" element={<AdminRoute><AdminLoans /></AdminRoute>} />
        <Route path="/admin/register-client" element={<AdminRoute><RegisterClient /></AdminRoute>} />
        <Route path="/admin/create-loan" element={<AdminRoute><CreateLoan /></AdminRoute>} />
        <Route path="/admin/clients" element={<AdminRoute><Clients /></AdminRoute>} />

        {/* Client routes */}
        <Route path="/client/loans" element={<PrivateRoute><MyLoans /></PrivateRoute>} />
        <Route path="/client/request-loan" element={<PrivateRoute><RequestLoan /></PrivateRoute>} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}