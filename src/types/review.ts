export interface ReviewBuyer {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ReviewProduct {
  id: string;
  name: string;
  slug: string;
}

export type ReviewStatus = "published" | "hidden" | "flagged";

export interface Review {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  interactionId: string | null;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  buyer?: ReviewBuyer;
  product?: ReviewProduct;
}

export interface ReviewListData {
  data: Review[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
  links: {
    first: string | null;
    last: string | null;
    current: string | null;
    next?: string | null;
    previous?: string | null;
  };
}

export interface ReviewQueryParams {
  page?: number;
  limit?: number;
}

export interface ReviewEligibility {
  eligible: boolean;
  reason?: string;
  alreadyReviewed: boolean;
  review: Review | null;
}

export interface CreateReviewPayload {
  productId: string;
  sellerId: string;
  interactionId?: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
}

export interface CreateReviewResponse {
  success: boolean;
  message: string;
  data: { review: Review };
}
