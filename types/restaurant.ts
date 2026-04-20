export interface ActivateRestaurantParams {
    id: string;
}

export interface RestaurantStatus {
    id: string;
    name: string;
    isActive: boolean;
    isVerified: boolean;
}

export interface ActivateRestaurantResponse {
    message: string;
    restaurant: RestaurantStatus;
}

export interface DeactivateRestaurantResponse {
    message: string;
    restaurant: RestaurantStatus;
}

export interface VerifyRestaurantResponse {
    message: string;
    restaurant: RestaurantStatus;
}

export interface UnverifyRestaurantResponse {
    message: string;
    restaurant: RestaurantStatus;
}

export interface AdminRestaurantManager {
    id: string;
    name: string;
    email: string | null;
    phoneNumber: string | null;
}

export interface AdminRestaurant {
    id: string;
    managerId: string;

    name: string;
    description: string | null;
    image: string | null;
    address: string;

    isActive: boolean;
    isVerified: boolean;
    isOpen: boolean;

    costForTwo: number;
    cuisineTypes: string[];

    rating: number;
    ratingCount: number;

    fssaiCode: string;
    gstNumber: string;

    createdAt: string;

    manager?: AdminRestaurantManager;
}

export interface GetAdminRestaurantsResponse {
    data: AdminRestaurant[];
    total: number;
    page: number;
    limit: number;
}

export type MenuItemType = "VEG" | "NON_VEG" | "VEGAN" | null;

export interface CategoryItem {
    id: string;
    categoryId: string;
    name: string;
    description: string | null;
    price: number;
    image: string | null;
    type: MenuItemType;
    isAvailable: boolean;
    isBestseller: boolean;
    spiceLevel: string | null;
    prepTime: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface MenuItem {
    id: string;
    categoryId: string;
    name: string;
    description: string | null;
    price: number;
    image: string | null;
    type: MenuItemType;
    isAvailable: boolean;
    isBestseller: boolean;
    spiceLevel: string | null;
    prepTime: number | null;
    createdAt: string;
    updatedAt: string;

    // nested
    category: MenuCategory;
}

export interface MenuCategory {
    id: string;
    name: string;
    restaurantId: string;
    image: string | null;
    type: MenuItemType;
    createdAt: string;
    updatedAt: string;

    // 🔥 added for admin view
    restaurant?: {
        name: string;
    };

    // 🔥 nested items
    items: CategoryItem[];
}