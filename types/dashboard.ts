export interface PendingRequestsStats {
  restaurant: number;
  delivery: number;
}

export interface AdminStatsResponse {
  totalUsers: number;
  totalRestaurants: number;
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  activeDrivers: number;
  pendingRequests: PendingRequestsStats;
}

export type OrderStatus =
  | "PLACED"
  | "ACCEPTED"
  | "PICKED_UP"
  | "DELIVERED"
  | "CANCELLED";

export interface GetAdminOrdersParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

// 👤 Customer
export interface OrderCustomer {
  id: string;
  name: string;
  email: string;
}

// 🍽️ Restaurant
export interface OrderRestaurant {
  id: string;
  name: string;
}

// 🚴 Driver
export interface OrderDriver {
  id: string;
  userId: string;
}

// 📦 Order
export interface AdminOrder {
  id: string;

  customerId: string;
  restaurantId: string;
  driverId: string | null;

  status: OrderStatus;

  otp: string;
  cancellationReason: string | null;

  itemTotal: number;
  tax: number;
  deliveryCharge: number;
  platformFee: number;
  driverTip: number;
  discount: number;
  promoCode: string | null;
  commission: number;
  totalAmount: number;

  paymentMode: "COD" | "WALLET" | "ONLINE";
  isPaid: boolean;

  placedAt: string;
  acceptedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;

  customer: OrderCustomer;
  restaurant: OrderRestaurant;
  driver: OrderDriver | null;
}

// 🔹 Response
export interface GetAdminOrdersResponse {
  data: AdminOrder[];
  total: number;
  page: number;
  limit: number;
}