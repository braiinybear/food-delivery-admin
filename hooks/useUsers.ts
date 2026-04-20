import { apiRequest } from "@/lib/api";
import { ChangeUserRoleRequest, ChangeUserRoleResponse, CreateUserPayload, CreateUserResponse, GetAdminUsersParams, GetAdminUsersResponse } from "@/types/users";
import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";

export const fetchAdminUsersPaged = ({
    page,
    limit,
    role,
}: {
    page: number;
    limit: number;
    role?: string;
}) => {
    return apiRequest<GetAdminUsersResponse>("/api/admin/users", {
        method: "GET",
        params: { page, limit, role },
    });
};


const DEFAULT_LIMIT = 20;

export const useAdminUsers = (params: GetAdminUsersParams) =>
    useInfiniteQuery<GetAdminUsersResponse, Error, InfiniteData<GetAdminUsersResponse>, unknown[], number>({
        queryKey: ["admin-users", params],

        queryFn: ({ pageParam = 1 }) =>
            fetchAdminUsersPaged({
                page: pageParam as number,
                limit: params.limit || DEFAULT_LIMIT,
                role: params.role,
            }),

        initialPageParam: 1,

        // 🔥 No totalPages → compute here
        getNextPageParam: (lastPage) => {
            const { page, limit, total } = lastPage;

            const hasNextPage = page * limit < total;

            return hasNextPage ? page + 1 : undefined;
        },
    });



export const changeUserRole = (payload: ChangeUserRoleRequest) => {
    return apiRequest<ChangeUserRoleResponse>(
        "/api/admin/users/role",
        {
            method: "PATCH",
            data: payload,
        }
    );
};


export const useChangeUserRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: changeUserRole,

        // 🔥 Important: refresh users list after role change
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin-users"],
            });
        },
    });
};



export const createAdminUser = (data: CreateUserPayload) => {
    return apiRequest<CreateUserResponse>(
        "/api/admin/users",
        {
            method: "POST",
            data,
        }
    );
};


export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAdminUser,

        onSuccess: () => {
            // 🔥 refresh users list
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        },
    });
};