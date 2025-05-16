
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Destinations from "./pages/Destinations";
import DestinationDetail from "./pages/DestinationDetail";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AdminPanel from "./pages/AdminPanel";
import AdminDestinations from "./pages/AdminDestinations";
import AdminBlog from "./pages/AdminBlog";
import AdminSettings from "./pages/AdminSettings";
import AdminBookings from "./pages/AdminBookings";
import BookingPage from "./pages/BookingPage";
import BookingSuccess from "./pages/BookingSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/destinations" element={<Destinations />} />
                <Route path="/destinations/:id" element={<DestinationDetail />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/book/:id" element={<BookingPage />} />
                <Route path="/booking-success" element={<BookingSuccess />} />
                
                {/* Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requiresAdmin={true}>
                      <AdminPanel />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/destinations" 
                  element={
                    <ProtectedRoute requiresAdmin={true}>
                      <AdminDestinations />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/blog" 
                  element={
                    <ProtectedRoute requiresAdmin={true}>
                      <AdminBlog />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/settings" 
                  element={
                    <ProtectedRoute requiresAdmin={true}>
                      <AdminSettings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/bookings" 
                  element={
                    <ProtectedRoute requiresAdmin={true}>
                      <AdminBookings />
                    </ProtectedRoute>
                  } 
                />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
