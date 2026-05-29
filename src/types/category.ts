export interface Category {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  parentId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  // populated when fetching with relations
  parent?: Pick<Category, "id" | "name" | "icon" | "code">;
  children?: Category[];
}

export interface PaginatedMeta {
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CategoryListData {
  data: Category[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
  links: {
    first: string;
    last: string;
    current: string;
  };
}

export interface CategoryListResponse {
  success: boolean;
  message: string;
  data: CategoryListData;
}

export interface CategoryDetailResponse {
  success: boolean;
  message: string;
  data: CategoryDetail;
}

export interface CategoryDetail {
  category: Category;
}

export interface CategoryParams {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string | null;
}
