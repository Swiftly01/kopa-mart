import { User } from "./user";

export interface CreateProductResponse {
  success: boolean;
  message: string;
  data: {
    product: {
      id: string;
      name: string;
      slug: string;
      description: string;
      price: number;
      stock: number;
      images: string[];
    };
  };
}

export interface ProductParams {
  page?: number;
  limit?: number;
  search?: string;
  sellerId?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  condition: string;
  discountPercentage: number;
  status: string;
  isActive: boolean;
  sku: string | null;
  rating: string;
  reviewCount: number;
  views: number;

  sellerId: string;
  categoryId: string;

  stateCode: string;
  stateName: string;
  lgaName: string;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  images: ProductImage[];
  category: Category;
  seller?: User | null;
}

export interface ProductImage {
  id: string;
  productId: string;

  filename: string;
  format: string;
  fileSize: number | null;

  cloudinaryPublicId: string;
  cloudinaryUrl: string;

  isMain: boolean;
  order: number;

  uploadedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  code: string;
  description: string;
  icon: string;

  parentId: string | null;

  isActive: boolean;
  isFeatured: boolean;

  sortOrder: number;

  metadata: Record<string, unknown> | null;
  attributes: Record<string, unknown> | null;

  createdAt: string;
  updatedAt: string;
}

export interface ProductListData {
  data: Product[];
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

export interface ProductSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sellerId?: string;
  categoryId?: string;
  categorySlug?: string;
  stateName?: string;
  stateCode?: string;
  lgaName?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  sortBy?: string;
}

export enum ProductCondition {
  NEW = "new",
  LIKE_NEW = "like_new",
  GOOD = "good",
  FAIR = "fair",
}

export enum SortBy {
  NEWEST = "newest",
  PRICE_ASC = "price-asc",
  PRICE_DESC = "price-desc",
  POPULAR = "popular",
}

export interface FilterState {
  stateName: string;
  lgaName: string;
  minPrice: string;
  maxPrice: string;
  condition: string;
  sortBy: string;
}
