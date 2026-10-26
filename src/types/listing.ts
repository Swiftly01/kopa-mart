// ---------- form description sent by the backend ----------

export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "url"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "photos"
  | "location";

export type OptionValue = string | number;

export interface FormFieldOption {
  value: OptionValue;
  label: string;
  // shown first, under a "Popular" heading
  popular?: boolean;
}

export interface FormField {
  // where the value goes in the payload, e.g. "title" or "details.bedrooms"
  key: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  helperText?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: FormFieldOption[];
  searchable?: boolean;
  defaultValue?: string | number | boolean | null;
  // photos only
  minItems?: number;
  maxItems?: number;
  accept?: string[];
  maxFileSizeMb?: number;
}

export interface ListingFormSchema {
  category: { id: string; code: string; name: string };
  version: number;
  fields: FormField[];
}

// ---------- categories you can post into ----------

export interface PostableCategory {
  id: string;
  code: string;
  name: string;
  slug: string;
  icon: string | null;
  // true when ads can be posted straight into this category
  postable: boolean;
  children: PostableCategory[];
}

// ---------- listings ----------

export type ListingStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "rejected"
  | "inactive"
  | "removed";

export interface ListingImage {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  position: number;
}

export interface ListingCardData {
  id: string;
  slug: string;
  title: string;
  price: number;
  negotiable: "yes" | "no" | "not_sure";
  categoryId: string;
  stateCode: string;
  stateName: string;
  lgaName: string;
  status: ListingStatus;
  rating: number;
  reviewCount: number;
  // only set while the ad is rejected
  rejectionReason: string | null;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export interface ListingDetailData extends ListingCardData {
  description: string;
  videoUrl: string | null;
  views: number;
  category: { id: string; code: string; name: string };
  images: ListingImage[];
  // category-specific values (bedrooms, furnishing, ...)
  details: Record<string, unknown> | null;
  seller: PublicSeller | null;
}

// the seller details shown on the public ad page
export interface PublicSeller {
  id: string;
  name: string;
  phoneNumber: string | null;
  isEmailVerified: boolean;
  joinedAt: string | null;
}

// ---------- admin review ----------

export interface AdminSeller extends PublicSeller {
  email: string;
}

export interface AdminListingCardData extends ListingCardData {
  seller: Pick<AdminSeller, "id" | "name" | "email" | "phoneNumber"> | null;
}

export interface AdminListingDetailData extends ListingDetailData {
  seller: AdminSeller | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

export interface AdminListingPage {
  data: AdminListingCardData[];
  meta: ListingPage["meta"];
}

// ads per status, for the admin tab badges
export type AdminListingStats = Partial<Record<ListingStatus, number>>;

export interface AdminListingParams {
  page?: number;
  limit?: number;
  status?: ListingStatus;
  search?: string;
}

// public browse filters (the homepage filter sends these)
export interface ListingSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  sellerId?: string;
  stateName?: string;
  lgaName?: string;
}

export interface ListingPage {
  data: ListingCardData[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface MyListingsParams {
  page?: number;
  limit?: number;
  status?: ListingStatus;
}