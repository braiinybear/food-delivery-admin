import { apiRequest } from "@/lib/api";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GetAdminRestaurantsResponse } from "@/types/restaurant";
import { InfiniteData } from "@tanstack/react-query";

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

export const useToggleRestaurantActive = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
            return apiRequest<{ message: string }>(
                `/api/admin/restaurants/${id}/${isActive ? "activate" : "deactivate"}`,
                { method: "PATCH" }
            );
        },
        onSuccess: () => {
            // Refresh restaurants list after state change
            queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        },
    });
};

export const useToggleRestaurantVerify = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isVerified }: { id: string; isVerified: boolean }) => {
            return apiRequest<{ message: string }>(
                `/api/admin/restaurants/${id}/${isVerified ? "verify" : "unverify"}`,
                { method: "PATCH" }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
        },
    });
};
