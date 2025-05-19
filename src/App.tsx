
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
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BookingPage from "./pages/BookingPage";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Destinations from "./pages/Destinations";
import DestinationDetail from "./pages/DestinationDetail";
import BookingSuccess from "./pages/BookingSuccess";
import Auth from "./pages/Auth";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/about" element={<Layout><About /></Layout>} />
                <Route path="/contact" element={<Layout><Contact /></Layout>} />
                <Route path="/blog" element={<Layout><Blog /></Layout>} />
                <Route path="/blog/:id" element={<Layout><BlogPost /></Layout>} />
                <Route path="/destinations" element={<Layout><Destinations /></Layout>} />
                <Route path="/destinations/:id" element={<Layout><DestinationDetail /></Layout>} />
                <Route path="/booking/:id" element={<Layout><BookingPage /></Layout>} />
                <Route path="/booking-success" element={<Layout><BookingSuccess /></Layout>} />
                <Route path="/auth" element={<Layout><Auth /></Layout>} />
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
          </ErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
