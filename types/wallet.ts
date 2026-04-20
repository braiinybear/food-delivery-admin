import { RequestStatus } from "@prisma/client";

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  bankInfo: string;
  status: RequestStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface GetWithdrawalsResponse {
  data: WithdrawalRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface ResolveWithdrawalPayload {
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}
