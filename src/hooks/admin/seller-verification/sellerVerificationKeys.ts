export const sellerVerificationKeys = {
  all: ["seller-verification"] as const,
  pending: () => [...sellerVerificationKeys.all, "pending-verifications"] as const,
  getPending: (page: number, limit: number) =>
    [...sellerVerificationKeys.pending(), page, limit] as const,
  byStatus: (status: string) =>
    [...sellerVerificationKeys.all, "by-status", status] as const,
  byStatusPaginated: (status: string, page: number, limit: number) =>
    [...sellerVerificationKeys.byStatus(status), page, limit] as const,
  getDetail: (userId: string) =>
    [...sellerVerificationKeys.all, "detail", userId] as const,
};