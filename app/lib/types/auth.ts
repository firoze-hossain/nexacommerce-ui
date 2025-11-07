// lib/types/auth.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: {
    id: number;
    name: string;
    description: string;
    permissions: Permission[];
    createdAt: string;
    updatedAt: string;
  };
  active: boolean;
  createdAt: string;
  updatedAt: string;
    customerId?: number;
    vendorId?: number;
}

export interface Permission {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    type: string;
    refreshToken: string;
    user: User;
  };
  timestamp: string;
  statusCode: number;
}

// lib/types/product.ts
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
  vendor: Vendor;
  images: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: number;
  businessName: string;
  email: string;
  phone: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Helper functions for user roles
export const isCustomer = (user: User | null): boolean => {
    return user?.role?.name === 'CUSTOMER';
};

export const isVendor = (user: User | null): boolean => {
    return user?.role?.name === 'VENDOR';
};

export const isAdmin = (user: User | null): boolean => {
    return user?.role?.name === 'ADMIN' || user?.role?.name === 'SUPERADMIN';
};

export const hasPermission = (user: User | null, permission: string): boolean => {
    if (!user?.role?.permissions) return false;
    return user.role.permissions.some(perm => perm.name === permission);
};