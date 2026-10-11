import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Store, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Star, 
  Package, 
  AlertCircle,
  Eye,
  Search,
  UserCheck
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const { 
    bookings, 
    products, 
    currentUser, 
    ownerAcceptBooking, 
    ownerRejectBooking, 
    openAddProduct, 
    openReturnInspection, 
    openReview 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'returns' | 'inventory' | 'completed'>('requests');

  const ownerBookings = bookings.filter(b => b.ownerId === currentUser.id);
  const ownerProducts = products.filter(p => p.ownerId === currentUser.id);

  // Status-filtered bookings
  const pendingRequests = ownerBookings.filter(b => b.status === 'PENDING_APPROVAL');
  const activeRentals = ownerBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'IN_USE');
  const pendingInspection = ownerBookings.filter(b => b.status === 'RETURNED');
  const completedRentals = ownerBookings.filter(b => b.status === 'COMPLETED');

  // Calculate earnings
  const totalEarnings = ownerBookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'IN_USE' || b.status === 'RETURNED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.rentalAmount + (b.totalDeduction || 0), 0);

  const totalHeldDeposit = activeRentals.reduce((sum, b) => sum + b.depositAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full border border-teal-200">
              Shopkeeper Command Center
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Store ID: {currentUser.id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentUser.location} • ★ {currentUser.rating} ({currentUser.reviewsCount} customer ratings)
          </p>
        </div>

        <button
          onClick={openAddProduct}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <PlusCircle className="w-5 h-5" />
          <span>List New Rental Product</span>
        </button>
      </div>

      {/* Metric Cards (Proposal Section 6 - Key Performance Metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        
        {/* Total Earnings */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">₹{totalEarnings}</span>
            <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">Rental fees & deductions</span>
          </div>
        </div>

        {/* Active Rentals in Field */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">In Field / Active</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{activeRentals.length}</span>
            <span className="text-[11px] text-blue-600 font-bold block mt-0.5">Items currently rented out</span>
          </div>
        </div>

        {/* Pending Action Items */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Pending Actions</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-600">
              {pendingRequests.length + pendingInspection.length}
            </span>
            <span className="text-[11px] text-amber-600 font-bold block mt-0.5">
              {pendingRequests.length} requests • {pendingInspection.length} returns
            </span>
          </div>
        </div>

        {/* Held Escrow Deposit */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Security Deposit Escrow</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-teal-800">₹{totalHeldDeposit}</span>
            <span className="text-[11px] text-teal-600 font-bold block mt-0.5">Protected via Razorpay</span>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 mt-8 pb-px">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'requests'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Incoming Requests</span>
          {pendingRequests.length > 0 && (
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-600 text-white font-extrabold">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'returns'
              ? 'border-purple-600 text-purple-800 bg-purple-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Returns Pending Inspection</span>
          {pendingInspection.length > 0 && (
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-600 text-white font-extrabold">
              {pendingInspection.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'active'
              ? 'border-blue-600 text-blue-800 bg-blue-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Active In-Field ({activeRentals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'border-slate-800 text-slate-900 bg-slate-100/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>My Product Listings ({ownerProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'completed'
              ? 'border-slate-800 text-slate-900 bg-slate-100/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Past Completed ({completedRentals.length})</span>
        </button>
      </div>

      {/* Tab 1: Incoming Requests (Figure 1: Accept or Reject) */}
      {activeTab === 'requests' && (
        <div className="mt-6 space-y-4">
          {pendingRequests.length > 0 ? (
            pendingRequests.map(booking => (
              <div 
                key={booking.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={booking.productImage}
                    alt={booking.productTitle}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">{booking.id}</span>
                    <h4 className="text-base font-bold text-slate-900">{booking.productTitle}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Customer: <strong className="text-slate-800">{booking.customerName}</strong> (★ {booking.customerRating})</span>
                      <span>•</span>
                      <span className="font-semibold text-emerald-700">
                        {booking.startDate} to {booking.endDate} ({booking.rentalDays} days)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <div className="text-sm font-bold text-slate-900">Rental Income: ₹{booking.rentalAmount}</div>
                    <div className="text-[11px] text-teal-700 font-semibold">+ ₹{booking.depositAmount} Deposit</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => ownerRejectBooking(booking.id)}
                      className="px-3.5 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                    <button
                      onClick={() => ownerAcceptBooking(booking.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept Request</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-700">All caught up!</p>
              <p className="text-xs">No pending booking requests right now.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Returns Pending Inspection (Figure 2 & Section 5.4) */}
      {activeTab === 'returns' && (
        <div className="mt-6 space-y-4">
          {pendingInspection.length > 0 ? (
            pendingInspection.map(booking => (
              <div 
                key={booking.id}
                className="bg-white rounded-3xl border-2 border-purple-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={booking.productImage}
                    alt={booking.productTitle}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      Item Handed Back by Customer
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{booking.productTitle}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Rented by: <strong className="text-slate-800">{booking.customerName}</strong> • Due: {booking.endDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-500 block">Security Deposit Held:</span>
                    <span className="text-base font-black text-teal-800">₹{booking.depositAmount}</span>
                  </div>

                  <button
                    onClick={() => openReturnInspection(booking.id)}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-purple-600/30 transition-all flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Inspect & Settle Deposit</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500">
              <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No returns awaiting inspection</p>
              <p className="text-xs">When a customer hands back an item, it will appear here for physical condition audit.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Active Rentals */}
      {activeTab === 'active' && (
        <div className="mt-6 space-y-4">
          {activeRentals.length > 0 ? (
            activeRentals.map(booking => (
              <div 
                key={booking.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={booking.productImage}
                    alt={booking.productTitle}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      booking.status === 'IN_USE' ? 'bg-teal-50 text-teal-800 border-teal-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {booking.status === 'IN_USE' ? 'In Use by Customer' : 'Confirmed • Awaiting Pickup'}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{booking.productTitle}</h4>
                    <p className="text-xs text-slate-500">
                      Rented to: {booking.customerName} ({booking.customerPhone}) • Window: {booking.startDate} to {booking.endDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Total Paid:</span>
                    <span className="text-sm font-bold text-slate-900">₹{booking.totalAmount}</span>
                  </div>

                  <button
                    onClick={() => openReturnInspection(booking.id)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                  >
                    Simulate Return & Inspect
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No active rentals right now</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: My Inventory Listings */}
      {activeTab === 'inventory' && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ownerProducts.map(product => (
            <div key={product.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="relative aspect-16/10 bg-slate-100">
                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-white/90 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {product.category}
                </span>
                <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{product.title}</h4>
                <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-base font-extrabold text-slate-900">₹{product.dailyRate}</span>
                    <span className="text-xs text-slate-500"> / day</span>
                  </div>
                  <span className="text-xs text-teal-700 font-semibold">
                    Deposit: ₹{product.securityDeposit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Past Completed Rentals */}
      {activeTab === 'completed' && (
        <div className="mt-6 space-y-4">
          {completedRentals.map(booking => (
            <div key={booking.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src={booking.productImage} alt="" className="w-14 h-14 rounded-2xl object-cover border" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{booking.productTitle}</h4>
                  <p className="text-xs text-slate-500">Customer: {booking.customerName} • Returned: {booking.returnedAt}</p>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    Razorpay Deposit Refund: ₹{booking.refundedDeposit} settled ({booking.razorpayRefundId})
                  </p>
                </div>
              </div>

              {!booking.ownerReviewed ? (
                <button
                  onClick={() => openReview(booking.id)}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                >
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>Rate Customer</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-700">★ Reviewed</span>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
