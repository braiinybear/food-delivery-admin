import { apiRequest } from "@/lib/api";
import { GetWithdrawalsResponse, ResolveWithdrawalPayload, WithdrawalRequest } from "@/types/wallet";
import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";

interface GetWithdrawalsParams {
    status?: string;
    limit?: number;
}

export const fetchAllWithdrawals = ({
    page,
    limit = 20,
    status,
}: {
    page: number;
    limit?: number;
    status?: string;
}) => {
    return apiRequest<GetWithdrawalsResponse>("/api/wallets/withdrawals/all", {
        method: "GET",
        params: { page, limit, status },
    });
};

export const useAdminWithdrawals = (params: GetWithdrawalsParams) => {
    return useInfiniteQuery<GetWithdrawalsResponse, Error, InfiniteData<GetWithdrawalsResponse>, unknown[], number>({
        queryKey: ["admin-withdrawals", params],
        queryFn: ({ pageParam = 1 }) => fetchAllWithdrawals({ page: pageParam, limit: params.limit, status: params.status }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, limit, total } = lastPage;
            return page * limit < total ? page + 1 : undefined;
        },
    });
};

export const useResolveWithdrawal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: ResolveWithdrawalPayload }) => {
            return apiRequest<WithdrawalRequest>(`/api/wallets/withdrawals/${id}/resolve`, {
                method: "PATCH",
                data: payload,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        },
    });
};
