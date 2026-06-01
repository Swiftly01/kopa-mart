import { Product } from "@/types/product";



export interface SavedProductPayload {
  productId: string;
}


export interface ToggleSavedProductResponse {
  isSaved: boolean;
}


export interface SaveStatusResponse {
  isSaved: boolean;
  savedId?: string;
}


export type BatchSaveStatusResponse = Record<string, boolean>;


export interface SavedProductItem {
  id: string;
  buyerId: string;
  productId: string;
  note: string | null;
  createdAt: string;   
  deletedAt: string | null;
  product: Product;   
}



export interface PaginationMeta {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface PaginationLinks {
  first: string;
  last: string;
  current: string;
  next?: string;
  previous?: string;
}


export interface PaginatedSavedProducts {
  data: SavedProductItem[];
  meta: PaginationMeta;
  links: PaginationLinks;
}



export interface GetSavedProductsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  sortBy?: "createdAt" | "price" | "name";
  sortOrder?: "ASC" | "DESC";
}