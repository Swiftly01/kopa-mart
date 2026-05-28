export type NestValidationErrorResponse = {
  message: {
    field: string;
    message: string;
  }[];
};

export interface ApiResponseError {
  message?: string;
}


export interface ApiResponse<T> {
  data: T;
}

export type ApiErrorMessage = string | string[];

export interface ApiErrorResponse {
  statusCode: number;
  message: ApiErrorMessage;
  error: string;
}
