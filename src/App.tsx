
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import BookingPage from './pages/BookingPage';
import BookingSuccess from './pages/BookingSuccess';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import NotFound from './pages/NotFound';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import SecurityHeaders from './components/SecurityHeaders';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from './components/ui/toaster';
import AdminPanel from './pages/AdminPanel';
import AdminBlog from './pages/AdminBlog';
import AdminDestinations from './pages/AdminDestinations';
import AdminSettings from './pages/AdminSettings';
import AdminBookings from './pages/AdminBookings';
import AdminContactMessages from './pages/AdminContactMessages';
import AdminLayout from './components/admin/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import OfflineBanner from './components/OfflineBanner';
import MyTrips from './pages/MyTrips';
import { Suspense, lazy } from 'react';

// Define loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-travel-gold"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="travel-theme">
        <BrowserRouter>
          <SecurityHeaders />
          <OfflineBanner />
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Layout><Outlet /></Layout>}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="destinations" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Destinations />
                  </Suspense>
                } />
                <Route path="destinations/:id" element={<DestinationDetail />} />
                <Route path="book/:id" element={<BookingPage />} />
                <Route path="booking/:id" element={<BookingPage />} />
                <Route path="booking-success" element={<BookingSuccess />} />
                <Route path="blog" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Blog />
                  </Suspense>
                } />
                <Route path="blog/:id" element={<BlogPost />} />
                <Route path="my-trips" element={
                  <ProtectedRoute>
                    <MyTrips />
                  </ProtectedRoute>
                } />
                <Route path="auth" element={
                  <PublicRoute redirectAuthenticatedTo="/">
                    <Auth />
                  </PublicRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Route>
              
              <Route path="/admin" element={
                <ProtectedRoute requiresAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminPanel />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="blog/new" element={<AdminBlog />} />
                <Route path="destinations" element={<AdminDestinations />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="contact-messages" element={<AdminContactMessages />} />
                <Route path="users" element={<AdminPanel />} />
              </Route>
            </Routes>
          </ErrorBoundary>
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
