
// Import AdminLayout component
import AdminLayout from '@/components/admin/AdminLayout';

// Replace the individual admin routes with a nested route structure:
<Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
  <Route index element={<AdminPanel />} />
  <Route path="users" element={<UserManagement />} />
  <Route path="destinations" element={<AdminDestinations />} />
  <Route path="bookings" element={<AdminBookings />} />
  <Route path="blog" element={<AdminBlog />} />
  <Route path="settings" element={<AdminSettings />} />
</Route>
