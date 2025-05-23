
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Suspense } from 'react';
import { Loader2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from './AdminSidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 pt-20">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <div className="fixed bottom-4 left-4 z-40">
              <SheetTrigger asChild>
                <Button size="icon" className="bg-travel-gold text-black hover:bg-amber-600 rounded-full shadow-lg">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
            </div>
            <SheetContent side="left" className="p-0 w-64">
              <AdminSidebar />
            </SheetContent>
          </Sheet>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
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
