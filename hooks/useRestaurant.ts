import { apiRequest } from "@/lib/api";
import { 
    ActivateRestaurantResponse, 
    DeactivateRestaurantResponse, 
    UnverifyRestaurantResponse, 
    VerifyRestaurantResponse,
    GetAdminRestaurantsResponse,
    MenuItem,
    MenuCategory
} from "@/types/restaurant";
import { useMutation, useQueryClient, useInfiniteQuery, InfiniteData, useQuery } from "@tanstack/react-query";

interface GetRestaurantsParams {
    storeName?: string;
    limit?: number;
}

export const fetchAdminRestaurants = ({
    page,
    limit = 20,
    storeName,
}: {
    page: number;
    limit?: number;
    storeName?: string;
}) => {
    return apiRequest<GetAdminRestaurantsResponse>("/api/admin/restaurants", {
        method: "GET",
        params: { page, limit, storeName },
    });
};

export const useAdminRestaurants = (params: GetRestaurantsParams) => {
    return useInfiniteQuery<GetAdminRestaurantsResponse, Error, InfiniteData<GetAdminRestaurantsResponse>, unknown[], number>({
        queryKey: ["admin-restaurants", params],
        queryFn: ({ pageParam = 1 }) => fetchAdminRestaurants({ page: pageParam, limit: params.limit, storeName: params.storeName }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, limit, total } = lastPage;
            return page * limit < total ? page + 1 : undefined;
        },
    });
};

export const activateRestaurant = (id: string) => {
    return apiRequest<ActivateRestaurantResponse>(
        `/api/admin/restaurants/${id}/activate`,
        {
            method: "PATCH",
        }
    );
};

export const useActivateRestaurant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => activateRestaurant(id),

        onSuccess: () => {
            // 🔥 refresh restaurant list + requests if needed
            queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
            queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
        },
    });
};

export const deactivateRestaurant = (id: string) => {
    return apiRequest<DeactivateRestaurantResponse>(
        `/api/admin/restaurants/${id}/deactivate`,
        {
            method: "PATCH",
        }
    );
};

export const useDeactivateRestaurant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deactivateRestaurant(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
            queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
        },
    });
};

export const verifyRestaurant = (id: string) => {
    return apiRequest<VerifyRestaurantResponse>(
        `/api/admin/restaurants/${id}/verify`,
        {
            method: "PATCH",
        }
    );
};

export const useVerifyRestaurant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => verifyRestaurant(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
            queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
        },
    });
};

export const unverifyRestaurant = (id: string) => {
    return apiRequest<UnverifyRestaurantResponse>(
        `/api/admin/restaurants/${id}/unverify`,
        {
            method: "PATCH",
        }
    );
};

export const useUnverifyRestaurant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => unverifyRestaurant(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
            queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
        },
    });
};



export const fetchMenuItems = () => {
  return apiRequest<MenuItem[]>("/api/menu-items", {
    method: "GET",
  });
};


export const useMenuItems = () => {
  return useQuery<MenuItem[]>({
    queryKey: ["admin-menu-items"],
    queryFn: fetchMenuItems,
  });
};


export const fetchMenuCategories = () => {
  return apiRequest<MenuCategory[]>("/api/menu-categories", {
    method: "GET",
  });
};


export const useMenuCategories = () => {
  return useQuery<MenuCategory[]>({
    queryKey: ["admin-menu-categories"],
    queryFn: fetchMenuCategories,
  });
};