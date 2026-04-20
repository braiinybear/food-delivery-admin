export type RequestType = "restaurant" | "delivery";

export type RequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface GetAdminRequestsParams {
  type: RequestType;
  status?: RequestStatus;
  page?: number;
  limit?: number;
}

export interface RequestUser {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
}



export interface RestaurantRequest {
  id: string;
  userId: string;

  restaurantName: string;
  description: string;
  address: string;
  lat: number;
  lng: number;

  cuisineTypes: string[];
  costForTwo: number;

  fssaiCode: string;
  gstNumber: string;

  logoUrl: string | null;
  bannerUrl: string | null;
  fssaiDocUrl: string | null;

  status: RequestStatus;
  rejectionReason: string | null;

  createdAt: string;
  updatedAt: string;

  user: RequestUser;
}


export interface DeliveryRequest {
  id: string;
  userId: string;

  vehicleType: string;
  licenseNumber: string;
  vehiclePlate: string;

  licenseFrontUrl: string;
  licenseBackUrl: string;
  vehicleRcUrl: string;
  profilePicUrl: string;

  status: RequestStatus;
  rejectionReason: string | null;

  createdAt: string;
  updatedAt: string;

  user: RequestUser;
}


export interface GetAdminRequestsResponse {
  data: (RestaurantRequest | DeliveryRequest)[];
  total: number;
  page: number;
  limit: number;
}

export interface ApproveRestaurantRequestParams {
  id: string;
}

export interface ApprovedUser {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  role: "RESTAURANT_MANAGER";

  image: string | null;
  emailVerified: boolean;
  phoneNumberVerified: boolean;

  dob: string | null;
  gender: string | null;

  isVeg: boolean;
  language: string;

  referralCode: string;
  referredById: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface ApproveRestaurantRequestResponse {
  message: string;
  request: RestaurantRequest;
  restaurant: ApprovedUser;
}



export interface RejectRestaurantRequestPayload {
  id: string;
  reason?: string; // optional
}

export interface RejectRestaurantRequestResponse {
  message: string;
  request: RestaurantRequest;
}

export interface ApproveDeliveryRequestParams {
  id: string;
}

// 👤 User promoted to delivery partner
export interface DriverProfileUser {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;

  role: "DELIVERY_PARTNER";

  image: string | null;
  emailVerified: boolean;
  phoneNumberVerified: boolean;

  dob: string | null;
  gender: string | null;

  isVeg: boolean;
  language: string;

  referralCode: string;
  referredById: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface ApproveDeliveryRequestResponse {
  message: string;

  request: DeliveryRequest; 

  driverProfile: DriverProfileUser;
}


export interface RejectDeliveryRequestPayload {
  id: string;
  reason?: string;
}

export interface RejectDeliveryRequestResponse {
  message: string;
  request: DeliveryRequest;
}