 
export interface User {
  id: string;
  email: string;
  firstName: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface AdminUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string | null;
}

 
export interface UserResponse {
  data: User[];
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
 