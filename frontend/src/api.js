// API client for No-Buy Flask backend

const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('nobuy_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = { ...getAuthHeader(), ...options.headers };
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return request(`/products?${query.toString()}`);
  },
  getCategories: () => request('/products/categories'),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (productData) => request('/products', { method: 'POST', body: JSON.stringify(productData) }),
  uploadProductImage: (image) => {
    const formData = new FormData();
    formData.append('image', image);
    return request('/products/upload', { method: 'POST', body: formData });
  },
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  getMyListings: () => request('/products/my-listings'),

  // Bookings
  createBooking: (bookingData) => request('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),
  getRenterBookings: () => request('/bookings/renter'),
  getOwnerBookings: () => request('/bookings/owner'),
  getBookingDetail: (id) => request(`/bookings/${id}`),
  updateBookingStatus: (id, status) => request(`/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Negotiations / Bargaining
  createNegotiation: (data) => request('/negotiations', { method: 'POST', body: JSON.stringify(data) }),
  getNegotiations: () => request('/negotiations'),
  respondNegotiation: (id, responseData) => request(`/negotiations/${id}/respond`, { method: 'PUT', body: JSON.stringify(responseData) }),

  // Payments (Simulated)
  processPayment: (paymentData) => request('/payments/checkout', { method: 'POST', body: JSON.stringify(paymentData) }),
  getReceipt: (paymentId) => request(`/payments/receipt/${paymentId}`),
  getMyPayments: () => request('/payments/my-payments'),

  // Returns & Quality Inspection
  requestReturn: (returnData) => request('/returns/request', { method: 'POST', body: JSON.stringify(returnData) }),
  inspectReturn: (returnId, inspectionData) => request(`/returns/${returnId}/inspect`, { method: 'PUT', body: JSON.stringify(inspectionData) }),
  getReturnByBooking: (bookingId) => request(`/returns/booking/${bookingId}`),

  // Reviews
  createReview: (reviewData) => request('/reviews', { method: 'POST', body: JSON.stringify(reviewData) }),
  getProductReviews: (productId) => request(`/reviews/product/${productId}`),
  getUserReviews: (userId) => request(`/reviews/user/${userId}`),

  // Dashboard & Notifications
  getDashboardSummary: () => request('/dashboard/summary'),
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),
};
