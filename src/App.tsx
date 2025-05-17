
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Dynamic imports for code splitting and performance
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Destinations = lazy(() => import('./pages/Destinations'));
const DestinationDetail = lazy(() => import('./pages/DestinationDetail'));
const Blog = lazy(() => import('./pages/Blog'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Auth = lazy(() => import('./pages/Auth'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const AdminDestinations = lazy(() => import('./pages/AdminDestinations'));
const AdminBlog = lazy(() => import('./pages/AdminBlog'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminBookings = lazy(() => import('./pages/AdminBookings'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const BookingSuccess = lazy(() => import('./pages/BookingSuccess'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Configure React Query with security best practices
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
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
                </Suspense>
              </Layout>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
