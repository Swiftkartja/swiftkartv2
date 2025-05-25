// User Types
export type UserRole = 'customer' | 'vendor' | 'rider' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInfo {
  id: string;
  userId: string;
  phone?: string;
  addresses?: Address[];
  paymentMethods?: PaymentMethod[];
  favorites?: string[];
  wallet?: Wallet;
}

export interface VendorInfo {
  id: string;
  userId: string;
  businessName: string;
  businessLogo: string;
  businessDescription: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessHours: BusinessHours[];
  categories: string[];
  rating: number;
  totalRatings: number;
  isOpen: boolean;
  wallet?: Wallet;
}

export interface RiderInfo {
  id: string;
  userId: string;
  vehicleType: string;
  vehiclePlate: string;
  isAvailable: boolean;
  currentLocation?: Location;
  rating: number;
  totalRatings: number;
  wallet?: Wallet;
  area?: string;
  completedDeliveries?: number;
  activeDeliveries?: number;
  earnings?: number;
}

export interface AdminInfo {
  id: string;
  userId: string;
  permissions: string[];
  wallet?: Wallet;
}

// Address Type
export interface Address {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}

// Payment Method Type
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  isDefault: boolean;
}

// Wallet Type
export interface Wallet {
  id: string;
  balance: number;
  currency: string;
  transactions: Transaction[];
}

// Transaction Type
export interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
}

// Business Hours Type
export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

// Location Type
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// Category Type
export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  color?: string;
}

// Product Type
export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  categories: string[];
  category?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  rating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

// Service Type
export interface Service {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categories: string[];
  duration: number;
  isAvailable: boolean;
  isFeatured: boolean;
  rating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

// Order Type
export interface Order {
  id: string;
  customerId: string;
  vendorId: string;
  riderId?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: Address;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  notes?: string;
}

// Order Item Type
export interface OrderItem {
  id: string;
  productId?: string;
  serviceId?: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  image?: string;
}

// Review Type
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  targetId: string;
  targetType: 'product' | 'service' | 'vendor' | 'rider';
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// Notification Type
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

// Chat Type
export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

// Message Type
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text?: string;
  image?: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image';
}

// Cart Item Type
export interface CartItem {
  id: string;
  productId?: string;
  serviceId?: string;
  vendorId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Payment Type for Fygaro integration
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  method: string;
  orderId?: string;
  customerId: string;
  vendorId?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  transactionId?: string;
  receiptUrl?: string;
}

// Map Marker Type for Google Maps integration
export interface MapMarker {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description?: string;
  type: 'pickup' | 'dropoff' | 'rider' | 'vendor' | 'customer';
}

// Route Type for Google Maps integration
export interface Route {
  origin: {
    latitude: number;
    longitude: number;
  };
  destination: {
    latitude: number;
    longitude: number;
  };
  waypoints?: {
    latitude: number;
    longitude: number;
  }[];
  mode?: 'driving' | 'walking' | 'bicycling';
  duration?: number;
  distance?: number;
}