
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminSidebar from './AdminSidebar';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 pt-20">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="h-12 w-12 animate-spin text-travel-gold" />
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;
