export type Role = 'CUSTOMER' | 'OWNER';

export type ProductCategory = 
  | 'All'
  | 'Power Tools'
  | 'Electronics & Cameras'
  | 'Camping & Outdoor'
  | 'Party & Events'
  | 'Sports & Fitness'
  | 'Home & Cleaning';

export type ProductCondition = 'Brand New' | 'Like New' | 'Good' | 'Fair';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatar: string;
  rating: number;
  reviewsCount: number;
  location: string;
  walletBalance: number;
}

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category: ProductCategory;
  dailyRate: number; // in INR
  securityDeposit: number; // in INR (refundable)
  condition: ProductCondition;
  images: string[];
  location: string;
  distanceKm: number;
  ownerId: string;
  ownerName: string;
  ownerRating: number;
  ownerReviewsCount: number;
  bookedRanges: DateRange[];
  includedAccessories?: string[];
  guidelines?: string[];
  isAvailable: boolean;
  createdAt: string;
}

export type BookingStatus =
  | 'PENDING_APPROVAL'     // Step 1: Customer requested, owner must accept/reject
  | 'APPROVED'             // Step 2: Owner accepted, waiting for customer payment
  | 'CONFIRMED'            // Step 3: Paid fee + deposit via Razorpay, ready for pickup
  | 'IN_USE'               // Step 4: Picked up, customer actively using
  | 'RETURNED'             // Step 5: Returned to owner, pending condition check
  | 'COMPLETED'            // Step 6: Inspected, deposit refunded/deductions processed
  | 'REJECTED'             // Owner rejected request
  | 'CANCELLED';           // Cancelled

export interface Booking {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  category: ProductCategory;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerRating: number;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  startDate: string;
  endDate: string;
  rentalDays: number;
  dailyRate: number;
  rentalAmount: number;
  depositAmount: number;
  totalAmount: number; // rentalAmount + depositAmount
  status: BookingStatus;
  paymentId?: string;
  paidAt?: string;
  pickedUpAt?: string;
  returnedAt?: string;
  inspectionNotes?: string;
  damageLevel?: 'None' | 'Minor' | 'Significant';
  isReturnedOnTime?: boolean;
  lateFee?: number;
  damageDeduction?: number;
  totalDeduction?: number;
  refundedDeposit?: number;
  razorpayRefundId?: string;
  customerReviewed?: boolean;
  ownerReviewed?: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  productId?: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: Role;
  targetId: string;
  rating: number; // 1 to 5
  comment: string;
  tags?: string[];
  date: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'payment';
  timestamp: string;
  read: boolean;
  bookingId?: string;
}
