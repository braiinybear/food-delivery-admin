import { apiRequest } from "@/lib/api";
import { Coupon, CreateCouponPayload, GetCouponsResponse } from "@/types/coupons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const createCoupon = (data: CreateCouponPayload) => {
    return apiRequest<Coupon>("/api/coupons", {
        method: "POST",
        data,
    });
};


export const useCreateCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCoupon,

        onSuccess: () => {
            // 🔥 refresh coupons list
            queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
        },
    });
};


export const getCoupons = () => {
    return apiRequest<GetCouponsResponse>(
        "/api/coupons/all",
        {
            method: "GET",
        }
    );
};


export const useCoupons = () => {
    return useQuery({
        queryKey: ["admin-coupons"],
        queryFn: getCoupons,

        staleTime: 1000 * 60, // 1 min cache
    });
};



export const activateCoupon = (id: string) => {
    return apiRequest<Coupon>(
        `/api/coupons/${id}/activate`,
        {
            method: "PATCH",
        }
    );
};



export const useActivateCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => activateCoupon(id),

        onSuccess: () => {
            // 🔥 refresh coupons list
            queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
        },
    });
};



export const deactivateCoupon = (id: string) => {
    return apiRequest<Coupon>(
        `/api/coupons/${id}/deactivate`,
        {
            method: "PATCH",
        }
    );
};



export const useDeactivateCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deactivateCoupon(id),

        onSuccess: () => {
            // 🔥 refresh coupons list
            queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
        },
    });
};