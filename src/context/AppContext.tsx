import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Role, 
  Product, 
  Booking, 
  User, 
  ProductCategory, 
  AppNotification 
} from '../types';
import { 
  currentUserCustomer, 
  currentUserOwner, 
  initialProducts, 
  initialBookings 
} from '../data/seedData';
import confetti from 'canvas-confetti';

interface DateFilter {
  startDate: string;
  endDate: string;
}

interface AppContextType {
  role: Role;
  currentUser: User;
  setRole: (role: Role) => void;
  products: Product[];
  bookings: Booking[];
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationsAsRead: () => void;
  
  // Search and filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: ProductCategory;
  setSelectedCategory: (cat: ProductCategory) => void;
  locationFilter: string;
  setLocationFilter: (loc: string) => void;
  dateFilter: DateFilter;
  setDateFilter: (range: DateFilter) => void;
  resetFilters: () => void;
  
  // Modal management
  activeModal: 'PRODUCT_DETAIL' | 'CHECKOUT' | 'ADD_PRODUCT' | 'RETURN_INSPECTION' | 'REVIEW' | 'HOW_IT_WORKS' | null;
  selectedProductId: string | null;
  selectedBookingId: string | null;
  openProductDetail: (id: string) => void;
  openCheckout: (bookingId: string) => void;
  openAddProduct: () => void;
  openReturnInspection: (bookingId: string) => void;
  openReview: (bookingId: string) => void;
  openHowItWorks: () => void;
  closeModal: () => void;
  
  // Core workflows
  createBooking: (productId: string, startDate: string, endDate: string) => { success: boolean; message: string; bookingId?: string };
  ownerAcceptBooking: (bookingId: string) => void;
  ownerRejectBooking: (bookingId: string) => void;
  processPayment: (bookingId: string, paymentMethod: string) => void;
  confirmPickup: (bookingId: string) => void;
  customerInitiateReturn: (bookingId: string) => void;
  ownerInspectAndSettle: (
    bookingId: string, 
    details: { 
      isReturnedOnTime: boolean; 
      damageLevel: 'None' | 'Minor' | 'Significant'; 
      lateFee: number; 
      damageDeduction: number; 
      notes: string;
    }
  ) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'bookedRanges' | 'ownerId' | 'ownerName' | 'ownerRating' | 'ownerReviewsCount' | 'distanceKm'>) => void;
  submitReview: (bookingId: string, rating: number, comment: string, tags?: string[]) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>(() => {
    const saved = localStorage.getItem('nobuy_role');
    return (saved as Role) || 'CUSTOMER';
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nobuy_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('nobuy_bookings');
    return saved ? JSON.parse(saved) : initialBookings;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Welcome to NoBuy!',
      message: 'Explore multi-category product rentals or switch to Owner Mode to list your items.',
      type: 'info',
      timestamp: 'Just now',
      read: false
    }
  ]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [locationFilter, setLocationFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>({ startDate: '', endDate: '' });

  // Modals
  const [activeModal, setActiveModal] = useState<AppContextType['activeModal']>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('nobuy_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('nobuy_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('nobuy_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const currentUser = role === 'CUSTOMER' ? currentUserCustomer : currentUserOwner;

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    addNotification({
      title: `Switched to ${newRole === 'CUSTOMER' ? 'Customer' : 'Owner / Shopkeeper'} Mode`,
      message: newRole === 'CUSTOMER' 
        ? 'You are now exploring and renting items.' 
        : 'You are now managing inventory, reviewing rental requests, and inspecting returns.',
      type: 'info'
    });
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif-' + Date.now(),
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setLocationFilter('');
    setDateFilter({ startDate: '', endDate: '' });
  };

  // Modal actions
  const openProductDetail = (id: string) => {
    setSelectedProductId(id);
    setActiveModal('PRODUCT_DETAIL');
  };

  const openCheckout = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setActiveModal('CHECKOUT');
  };

  const openAddProduct = () => {
    setActiveModal('ADD_PRODUCT');
  };

  const openReturnInspection = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setActiveModal('RETURN_INSPECTION');
  };

  const openReview = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setActiveModal('REVIEW');
  };

  const openHowItWorks = () => {
    setActiveModal('HOW_IT_WORKS');
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // Date conflict checker
  const isRangeConflicting = (start1: string, end1: string, start2: string, end2: string) => {
    const s1 = new Date(start1).getTime();
    const e1 = new Date(end1).getTime();
    const s2 = new Date(start2).getTime();
    const e2 = new Date(end2).getTime();
    return s1 <= e2 && e1 >= s2;
  };

  // Workflow 1: Create Booking Request (Figure 1 in Proposal)
  const createBooking = (productId: string, startDate: string, endDate: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return { success: false, message: 'Product not found.' };

    if (!startDate || !endDate) {
      return { success: false, message: 'Please specify both start and return dates.' };
    }

    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e < s) {
      return { success: false, message: 'Return date cannot be earlier than start date.' };
    }

    // Check availability conflict against confirmed bookings & product blackout dates
    const hasConflict = product.bookedRanges.some(range => 
      isRangeConflicting(startDate, endDate, range.startDate, range.endDate)
    );

    if (hasConflict) {
      return { 
        success: false, 
        message: 'This item is already booked for the selected dates. Please choose another window.' 
      };
    }

    const diffTime = Math.abs(e.getTime() - s.getTime());
    const rentalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    const rentalAmount = rentalDays * product.dailyRate;
    const depositAmount = product.securityDeposit;
    const totalAmount = rentalAmount + depositAmount;

    const newBookingId = `BK-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newBooking: Booking = {
      id: newBookingId,
      productId: product.id,
      productTitle: product.title,
      productImage: product.images[0],
      category: product.category,
      customerId: currentUserCustomer.id,
      customerName: currentUserCustomer.name,
      customerPhone: currentUserCustomer.phone,
      customerRating: currentUserCustomer.rating,
      ownerId: product.ownerId,
      ownerName: product.ownerName,
      ownerPhone: '+91 98123 45678',
      startDate,
      endDate,
      rentalDays,
      dailyRate: product.dailyRate,
      rentalAmount,
      depositAmount,
      totalAmount,
      status: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    // Temporarily reserve range
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          bookedRanges: [...p.bookedRanges, { startDate, endDate }]
        };
      }
      return p;
    }));

    setBookings(prev => [newBooking, ...prev]);

    addNotification({
      title: 'Booking Request Submitted',
      message: `Your request for "${product.title}" (${rentalDays} days) has been sent to ${product.ownerName} for review.`,
      type: 'info',
      bookingId: newBookingId
    });

    closeModal();
    return { success: true, message: 'Booking request placed successfully!', bookingId: newBookingId };
  };

  // Workflow 2: Owner Accept/Reject (Figure 1)
  const ownerAcceptBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: 'APPROVED' };
      }
      return b;
    }));

    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      addNotification({
        title: 'Booking Approved!',
        message: `Owner approved request for "${booking.productTitle}". Proceed to payment to secure booking.`,
        type: 'success',
        bookingId
      });
    }
  };

  const ownerRejectBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      // Release product booked range
      setProducts(prev => prev.map(p => {
        if (p.id === booking.productId) {
          return {
            ...p,
            bookedRanges: p.bookedRanges.filter(r => 
              !(r.startDate === booking.startDate && r.endDate === booking.endDate)
            )
          };
        }
        return p;
      }));
    }

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: 'REJECTED' };
      }
      return b;
    }));

    addNotification({
      title: 'Booking Declined',
      message: `Booking request was declined by the owner. Dates have been freed.`,
      type: 'warning',
      bookingId
    });
  };

  // Workflow 3: Razorpay Payment & Escrow Deposit (Figure 2)
  const processPayment = (bookingId: string, paymentMethod: string) => {
    const mockPaymentId = `pay_RPZ_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'CONFIRMED',
          paymentId: mockPaymentId,
          paidAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return b;
    }));

    const booking = bookings.find(b => b.id === bookingId);

    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    addNotification({
      title: 'Payment Confirmed via Razorpay',
      message: `Payment of ₹${booking?.totalAmount} (including ₹${booking?.depositAmount} refundable deposit) confirmed via ${paymentMethod}. Order ready for pickup!`,
      type: 'payment',
      bookingId
    });

    closeModal();
  };

  // Workflow 4: Handoff Confirmation
  const confirmPickup = (bookingId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'IN_USE',
          pickedUpAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return b;
    }));

    addNotification({
      title: 'Item Picked Up & In Use',
      message: 'Item has been handed over in person. Rental countdown is active.',
      type: 'info',
      bookingId
    });
  };

  // Workflow 5: Customer Initiates Return
  const customerInitiateReturn = (bookingId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'RETURNED',
          returnedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return b;
    }));

    addNotification({
      title: 'Item Handed Back to Owner',
      message: 'Item return logged. Waiting for owner condition inspection and deposit settlement.',
      type: 'info',
      bookingId
    });
  };

  // Workflow 6: Owner Condition Inspection & Razorpay Deposit Refund (Section 5.4 & Figure 2)
  const ownerInspectAndSettle = (
    bookingId: string, 
    details: { 
      isReturnedOnTime: boolean; 
      damageLevel: 'None' | 'Minor' | 'Significant'; 
      lateFee: number; 
      damageDeduction: number; 
      notes: string;
    }
  ) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const totalDeduction = details.lateFee + details.damageDeduction;
    const refundedDeposit = Math.max(0, booking.depositAmount - totalDeduction);
    const mockRefundId = `rfnd_RPZ_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'COMPLETED',
          isReturnedOnTime: details.isReturnedOnTime,
          damageLevel: details.damageLevel,
          lateFee: details.lateFee,
          damageDeduction: details.damageDeduction,
          totalDeduction,
          refundedDeposit,
          razorpayRefundId: mockRefundId,
          inspectionNotes: details.notes
        };
      }
      return b;
    }));

    // Release booked range from product
    setProducts(prev => prev.map(p => {
      if (p.id === booking.productId) {
        return {
          ...p,
          bookedRanges: p.bookedRanges.filter(r => 
            !(r.startDate === booking.startDate && r.endDate === booking.endDate)
          )
        };
      }
      return p;
    }));

    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 }
    });

    addNotification({
      title: 'Return Inspected & Deposit Settled',
      message: details.damageDeduction > 0 || details.lateFee > 0
        ? `Deposit adjusted: ₹${totalDeduction} deducted (${details.notes}). Net refund of ₹${refundedDeposit} issued via Razorpay Refund API.`
        : `Item verified in perfect condition! Full security deposit of ₹${refundedDeposit} refunded via Razorpay.`,
      type: 'success',
      bookingId
    });

    closeModal();
  };

  // Add Product Listing
  const addProduct = (newProdData: Omit<Product, 'id' | 'createdAt' | 'bookedRanges' | 'ownerId' | 'ownerName' | 'ownerRating' | 'ownerReviewsCount' | 'distanceKm'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      distanceKm: 0.8,
      ownerId: currentUserOwner.id,
      ownerName: currentUserOwner.name,
      ownerRating: currentUserOwner.rating,
      ownerReviewsCount: currentUserOwner.reviewsCount,
      bookedRanges: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setProducts(prev => [newProduct, ...prev]);

    addNotification({
      title: 'Product Listed Successfully',
      message: `"${newProduct.title}" is now live and discoverable for local rentals.`,
      type: 'success'
    });

    closeModal();
  };

  // Submit Review
  const submitReview = (bookingId: string, rating: number, comment: string, tags?: string[]) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        if (role === 'CUSTOMER') {
          return { ...b, customerReviewed: true };
        } else {
          return { ...b, ownerReviewed: true };
        }
      }
      return b;
    }));

    addNotification({
      title: 'Review Submitted',
      message: `Thank you for rating your rental experience (${rating} / 5 stars).`,
      type: 'success',
      bookingId
    });

    closeModal();
  };

  // Reset Demo
  const resetDemoData = () => {
    setProducts(initialProducts);
    setBookings(initialBookings);
    localStorage.removeItem('nobuy_products');
    localStorage.removeItem('nobuy_bookings');
    resetFilters();
    addNotification({
      title: 'Demo Data Reset',
      message: 'All products, active bookings, and inspection scenarios restored to factory state.',
      type: 'info'
    });
  };

  return (
    <AppContext.Provider
      value={{
        role,
        currentUser,
        setRole,
        products,
        bookings,
        notifications,
        unreadNotificationCount,
        markNotificationsAsRead,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        locationFilter,
        setLocationFilter,
        dateFilter,
        setDateFilter,
        resetFilters,
        activeModal,
        selectedProductId,
        selectedBookingId,
        openProductDetail,
        openCheckout,
        openAddProduct,
        openReturnInspection,
        openReview,
        openHowItWorks,
        closeModal,
        createBooking,
        ownerAcceptBooking,
        ownerRejectBooking,
        processPayment,
        confirmPickup,
        customerInitiateReturn,
        ownerInspectAndSettle,
        addProduct,
        submitReview,
        resetDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
