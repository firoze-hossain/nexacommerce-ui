// app/lib/types/customer.ts
export interface Customer {
    id: number;
    phone: string;
    profileImage: string | null;
    dateOfBirth: string | null;
    loyaltyPoints: number;
    totalOrders: number;
    totalSpent: number;
    currency: string | null;
    language: string | null;
    newsletterSubscribed: boolean;
    wishlistCount: number;
    reviewCount: number;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    createdAt: string;
    updatedAt: string;
}

export interface UserInfo {
    userId: number;
    name: string;
    email: string;
    active: boolean;
}

export interface CustomerDetail {
    customer: Customer;
    userInfo: UserInfo;
}

// For list view - customer with optional user info
export interface CustomerWithUserInfo extends Customer {
    userInfo?: UserInfo;
    name?: string;
    email?: string;
    active?: boolean;
}

export interface CustomerRegistrationRequest {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    dateOfBirth?: string;
    newsletterSubscribed?: boolean;
}

export interface CustomerUpdateRequest {
    phone?: string;
    profileImage?: string;
    dateOfBirth?: string;
    currency?: string;
    language?: string;
    newsletterSubscribed?: boolean;
}

export interface CustomerResponse {
    success: boolean;
    message: string;
    data: CustomerDetail;
    timestamp: string;
    statusCode: number;
}

export interface CustomersResponse {
    success: boolean;
    message: string;
    data: PaginatedCustomers;
    timestamp: string;
    statusCode: number;
}

export interface PaginatedCustomers {
    items: Customer[]; // List endpoint returns Customer[] without userInfo
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}