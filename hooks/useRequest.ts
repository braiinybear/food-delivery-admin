import { apiRequest } from "@/lib/api";
import { ApproveDeliveryRequestResponse, ApproveRestaurantRequestResponse, GetAdminRequestsParams, GetAdminRequestsResponse, RejectDeliveryRequestResponse, RejectRestaurantRequestResponse } from "@/types/request";
import { useInfiniteQuery, UseInfiniteQueryOptions, useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";

export const fetchAdminRequests = ({
    page,
    limit,
    type,
    status,
}: {
    page: number;
    limit: number;
    type: string;
    status?: string;
}) => {
    return apiRequest<GetAdminRequestsResponse>(
        "/api/admin/requests",
        {
            method: "GET",
            params: { page, limit, type, status },
        }
    );
};


export const useAdminRequests = (
  params: GetAdminRequestsParams,
  options?: Partial<UseInfiniteQueryOptions<GetAdminRequestsResponse, Error, InfiniteData<GetAdminRequestsResponse>, unknown[], number>>
) =>
  useInfiniteQuery<GetAdminRequestsResponse, Error, InfiniteData<GetAdminRequestsResponse>, unknown[], number>({
    queryKey: ["admin-requests", params],

    queryFn: ({ pageParam = 1 }) =>
      fetchAdminRequests({
        page: pageParam as number,
        limit: params.limit || 20,
        type: params.type,
        status: params.status,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      const { page, limit, total } = lastPage;
      return page * limit < total ? page + 1 : undefined;
    },

    ...options,
  });


export const approveRestaurantRequest = (id: string) => {
  return apiRequest<ApproveRestaurantRequestResponse>(
    `/api/admin/requests/restaurant/${id}/approve`,
    {
      method: "PATCH",
    }
  );
};

export const useApproveRestaurantRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveRestaurantRequest(id),

    onSuccess: () => {
      // 🔥 refresh requests list
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });

      // 🔥 also refresh users (role changed)
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });

      // 🔥 optional: restaurants list
      queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
    },
  });
};



export const rejectRestaurantRequest = ({
  id,
  reason,
}: {
  id: string;
  reason?: string;
}) => {
  return apiRequest<RejectRestaurantRequestResponse>(
    `/api/admin/requests/restaurant/${id}/reject`,
    {
      method: "PATCH",
      data: { reason },
    }
  );
};


export const useRejectRestaurantRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      reason,
    }: {
      id: string;
      reason?: string;
    }) => rejectRestaurantRequest({ id, reason }),

    onSuccess: () => {
      // 🔥 refresh requests list
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
    },
  });
};


export const approveDeliveryRequest = (id: string) => {
  return apiRequest<ApproveDeliveryRequestResponse>(
    `/api/admin/requests/delivery/${id}/approve`,
    {
      method: "PATCH",
    }
  );
};



export const useApproveDeliveryRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveDeliveryRequest(id),

    onSuccess: () => {
      // 🔥 refresh requests
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });

      // 🔥 role changed → refresh users
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });

      // 🔥 optional: drivers list if exists
      queryClient.invalidateQueries({ queryKey: ["admin-drivers"] });
    },
  });
};



export const rejectDeliveryRequest = ({
  id,
  reason,
}: {
  id: string;
  reason?: string;
}) => {
  return apiRequest<RejectDeliveryRequestResponse>(
    `/api/admin/requests/delivery/${id}/reject`,
    {
      method: "PATCH",
      data: { reason },
    }
  );
};

export const useRejectDeliveryRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      reason,
    }: {
      id: string;
      reason?: string;
    }) => rejectDeliveryRequest({ id, reason }),

    onSuccess: () => {
      // 🔥 refresh requests list
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
    },
  });
};