import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './components/customer/HeroSection';
import { CategoryFilter } from './components/customer/CategoryFilter';
import { ProductGrid } from './components/customer/ProductGrid';
import { BookingHistory } from './components/customer/BookingHistory';
import { OwnerDashboard } from './components/owner/OwnerDashboard';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { RazorpayModal } from './components/payment/RazorpayModal';
import { AddProductModal } from './components/owner/AddProductModal';
import { ReturnInspectionModal } from './components/owner/ReturnInspectionModal';
import { ReviewModal } from './components/common/ReviewModal';
import { HowItWorksModal } from './components/common/HowItWorksModal';

export const App: React.FC = () => {
  const { role } = useApp();
  const [currentTab, setCurrentTab] = useState<'browse' | 'bookings' | 'owner_dashboard'>(
    role === 'CUSTOMER' ? 'browse' : 'owner_dashboard'
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Navigation */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1">
        {role === 'CUSTOMER' ? (
          <>
            {currentTab === 'browse' ? (
              <>
                <HeroSection />
                <CategoryFilter />
                <ProductGrid />
              </>
            ) : (
              <BookingHistory />
            )}
          </>
        ) : (
          <OwnerDashboard />
        )}
      </main>

      {/* Global Interactive Modals */}
      <ProductDetailModal onSuccessNavigateToBookings={() => setCurrentTab('bookings')} />
      <RazorpayModal />
      <AddProductModal />
      <ReturnInspectionModal />
      <ReviewModal />
      <HowItWorksModal />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
