import { Route, Routes } from "react-router-dom";
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPanel from '@/pages/AdminPanel';
import UserManagement from '@/components/admin/UserManagement';
import AdminDestinations from '@/pages/AdminDestinations';
import AdminBookings from '@/pages/AdminBookings';
import AdminBlog from '@/pages/AdminBlog';
import AdminSettings from '@/pages/AdminSettings';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminPanel />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="destinations" element={<AdminDestinations />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}

export default App;