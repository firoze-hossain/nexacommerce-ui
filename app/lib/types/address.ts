// app/lib/types/address.ts
export interface Address {
    id: number;
    addressType: string; // 'HOME' | 'OFFICE'
    fullName: string;
    phone: string;
    area: string;
    addressLine: string;
    city: string;
    landmark: string;
    district: string;
    postCode: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
    fullAddress: string;
}

export interface AddressRequest {
    addressType: string;
    fullName: string;
    phone: string;
    area: string;
    addressLine: string;
    city?: string;
    landmark?: string;
    district?: string;
    postCode?: string;
    isDefault: boolean;
}

export interface GuestAddressRequest {
    fullName: string;
    phone: string;
    area: string;
    addressLine: string;
    city?: string;
    landmark?: string;
    district?: string;
    postCode?: string;
}