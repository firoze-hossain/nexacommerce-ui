// app/lib/types/vendor.ts
export enum BusinessType {
    INDIVIDUAL = 'INDIVIDUAL',
    SOLE_PROPRIETORSHIP = 'SOLE_PROPRIETORSHIP',
    PARTNERSHIP = 'PARTNERSHIP',
    CORPORATION = 'CORPORATION',
    LLC = 'LLC'
}

export enum VendorStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    SUSPENDED = 'SUSPENDED'
}

export interface Vendor {
    id: number;
    companyName: string;
    businessEmail: string;
    phone: string;
    businessType: BusinessType;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    website?: string;
    commissionRate: number;
    status: VendorStatus;
    totalProducts: number;
    totalOrders: number;
    totalSales: number;
    ratingAvg?: number;
    ratingCount: number;
    isVerified: boolean;
    verifiedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserInfo {
    userId: number;
    name: string;
    email: string;
    active: boolean;
}

export interface VendorDetail {
    vendor: Vendor;
    userInfo: UserInfo;
}

export interface VendorRegistrationRequest {
    contactPersonName: string;
    email: string;
    password: string;
    companyName: string;
    businessEmail: string;
    phone: string;
    businessType: BusinessType;
    taxNumber?: string;
    description?: string;
    website?: string;
    businessRegistrationNumber?: string;
}

export interface VendorUpdateRequest {
    companyName?: string;
    businessEmail?: string;
    phone?: string;
    description?: string;
    website?: string;
    taxNumber?: string;
    commissionRate?: number;
    status?: VendorStatus;
}

export interface VendorResponse {
    success: boolean;
    message: string;
    data: VendorDetail;
    timestamp: string;
    statusCode: number;
}

export interface VendorsResponse {
    success: boolean;
    message: string;
    data: PaginatedVendors;
    timestamp: string;
    statusCode: number;
}

export interface PaginatedVendors {
    items: Vendor[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}