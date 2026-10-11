import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Repeat, 
  ShoppingBag, 
  Store, 
  Bell, 
  HelpCircle, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  CreditCard, 
  Info,
  CalendarCheck,
  PlusCircle,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'browse' | 'bookings' | 'owner_dashboard';
  setCurrentTab: (tab: 'browse' | 'bookings' | 'owner_dashboard') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { 
    role, 
    setRole, 
    currentUser, 
    notifications, 
    unreadNotificationCount, 
    markNotificationsAsRead,
    openAddProduct,
    openHowItWorks,
    resetDemoData,
    bookings
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);

  // Count pending items requiring attention based on current role
  const pendingCustomerActionCount = bookings.filter(
    b => b.customerId === currentUser.id && (b.status === 'APPROVED' || b.status === 'IN_USE')
  ).length;

  const pendingOwnerActionCount = bookings.filter(
    b => b.ownerId === currentUser.id && (b.status === 'PENDING_APPROVAL' || b.status === 'RETURNED')
  ).length;

  const handleRoleToggle = (newRole: 'CUSTOMER' | 'OWNER') => {
    setRole(newRole);
    if (newRole === 'CUSTOMER') {
      setCurrentTab('browse');
    } else {
      setCurrentTab('owner_dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setCurrentTab(role === 'CUSTOMER' ? 'browse' : 'owner_dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Repeat className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 bg-clip-text text-transparent">
                  NoBuy
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Rental Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Rent & Borrow Locally • Zero Waste
              </p>
            </div>
          </div>

          {/* Center: Interactive Mode Switcher (Customer vs Shopkeeper) */}
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200/70 flex items-center shadow-inner">
            <button
              onClick={() => handleRoleToggle('CUSTOMER')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                role === 'CUSTOMER'
                  ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className={`w-4 h-4 ${role === 'CUSTOMER' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Customer View</span>
              {pendingCustomerActionCount > 0 && role === 'CUSTOMER' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => handleRoleToggle('OWNER')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                role === 'OWNER'
                  ? 'bg-white text-teal-800 shadow-sm border border-slate-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className={`w-4 h-4 ${role === 'OWNER' ? 'text-teal-600' : 'text-slate-400'}`} />
              <span>Shopkeeper / Owner</span>
              {pendingOwnerActionCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500 text-white font-bold">
                  {pendingOwnerActionCount}
                </span>
              )}
            </button>
          </div>

          {/* Right Navigation & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Action Navigation */}
            {role === 'CUSTOMER' ? (
              <div className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => setCurrentTab('browse')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentTab === 'browse'
                      ? 'text-emerald-700 bg-emerald-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Browse Items
                </button>
                <button
                  onClick={() => setCurrentTab('bookings')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'bookings'
                      ? 'text-emerald-700 bg-emerald-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>My Bookings</span>
                  {bookings.filter(b => b.status === 'APPROVED').length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={openAddProduct}
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List New Product</span>
              </button>
            )}

            {/* How It Works Modal Trigger */}
            <button
              onClick={openHowItWorks}
              title="How NoBuy Works (Proposal Workflow)"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Notification Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markNotificationsAsRead();
                }}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Activity & Notifications</span>
                    </div>
                    <span className="text-xs text-slate-400">{notifications.length} alerts</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-3 hover:bg-slate-50 transition-colors flex gap-3">
                        <div className="mt-0.5">
                          {notif.type === 'payment' && <CreditCard className="w-4 h-4 text-emerald-600" />}
                          {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          {notif.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{notif.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Demo Reset Button */}
            <button
              onClick={resetDemoData}
              title="Reset Demo Scenario"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* User Profile Chip */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/20"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">
                  ★ {currentUser.rating} ({currentUser.reviewsCount} reviews)
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
