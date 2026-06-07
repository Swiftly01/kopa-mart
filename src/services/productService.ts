import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import { CreateProductPayload } from "@/pages/seller-dashboard/CreateListing";
import {
  CreateProductResponse,
  Product,
  ProductListData,
  ProductParams,
  ProductSearchParams,
} from "@/types/product";

export class ProductService {
  static async createProduct(
    payload: CreateProductPayload,
  ): Promise<CreateProductResponse> {
    const response = await apiClient.post(
      `${apiBaseUrl}/api/v1/products`,
      payload,
    );

    // console.log(response);
    return response.data;
  }

  static async uploadProductImages(productId: string, data: FormData) {
    const response = await apiClient.post(
      `${apiBaseUrl}/api/v1/products/${productId}/images`,
      data,
    );

    // console.log(response);
    return response.data;
  }

  static async updateProduct(
    productId: string,
    payload: Partial<CreateProductPayload>,
  ) {
    const response = await apiClient.patch(
      `${apiBaseUrl}/api/v1/products/${productId}`,
      payload,
    );

    // console.log(response);
    return response.data;
  }

  static async getAllProducts(
    params?: ProductSearchParams,
  ): Promise<ProductListData> {
    const clean = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== "" && v !== null,
      ),
    );

    const response = await apiClient.get(`${apiBaseUrl}/api/v1/products`, {
      params: clean,
    });
    return response.data;
  }

  static async getSellerProducts(
    params?: ProductSearchParams,
  ): Promise<ProductListData> {
    const clean = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== "" && v !== null,
      ),
    );

    const response = await apiClient.get(`${apiBaseUrl}/api/v1/products/seller`, {
      params: clean,
    });
    return response.data;
  }

  static async getProductById(productId: string): Promise<Product> {
    const response = await apiClient.get(
      `${apiBaseUrl}/api/v1/products/${productId}`,
    );
    return response.data;
  }

  static async getProductBySlug(slug: string): Promise<Product> {
    const response = await apiClient.get(
      `${apiBaseUrl}/api/v1/products/slug/${slug}`,
    );
    return response.data;
  }

  static async publicSellerProducts(
    params: ProductParams & { sellerId: string },
  ) {
    const { sellerId, ...rest } = params;
    const response = await apiClient.get(
      `${apiBaseUrl}/api/v1/products/seller/${sellerId}`,
      { params: rest },
    );
    return response.data;
  }

  static async deleteProductImage(
    productId: string,
    imageId: string,
  ): Promise<Product> {
    const response = await apiClient.delete(
      `${apiBaseUrl}/api/v1/products/${productId}/images/${imageId}`,
    );
    return response.data;
  }

  static async deleteProduct(productId: string): Promise<Product> {
    const response = await apiClient.delete(
      `${apiBaseUrl}/api/v1/products/${productId}`,
    );
    return response.data;
  }
}
