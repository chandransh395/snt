
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPanel from '@/pages/AdminPanel';
import UserManagement from '@/components/admin/UserManagement';
import AdminDestinations from '@/pages/AdminDestinations';
import AdminBookings from '@/pages/AdminBookings';
import AdminBlog from '@/pages/AdminBlog';
import AdminSettings from '@/pages/AdminSettings';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route path="/admin" element={<ProtectedRoute requiresAdmin={true}><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminPanel />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="destinations" element={<AdminDestinations />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
