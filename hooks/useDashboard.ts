import { apiRequest } from "@/lib/api";
import { AdminStatsResponse, GetAdminOrdersParams, GetAdminOrdersResponse } from "@/types/dashboard";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const getAdminStats = () => {
    return apiRequest<AdminStatsResponse>(
        "/api/admin/stats",
        {
            method: "GET",
        }
    );
};

export const useAdminStats = () => {
    return useQuery({
        queryKey: ["admin-stats"],
        queryFn: getAdminStats,

        // 🔥 dashboard optimization
        staleTime: 1000 * 60, // 1 min cache
        refetchInterval: 1000 * 60, // auto refresh every 1 min
    });
};



export const fetchAdminOrders = ({
    page,
    limit,
    status,
}: {
    page: number;
    limit: number;
    status?: string;
}) => {
    return apiRequest<GetAdminOrdersResponse>(
        "/api/admin/orders",
        {
            method: "GET",
            params: { page, limit, status },
        }
    );
};



const DEFAULT_LIMIT = 20;

export const useAdminOrders = (params: GetAdminOrdersParams) =>
    useInfiniteQuery({
        queryKey: ["admin-orders", params],

        queryFn: ({ pageParam = 1 }) =>
            fetchAdminOrders({
                page: pageParam,
                limit: params.limit || DEFAULT_LIMIT,
                status: params.status,
            }),

        initialPageParam: 1,

        getNextPageParam: (lastPage) => {
            const { page, limit, total } = lastPage;
            return page * limit < total ? page + 1 : undefined;
        },
    });