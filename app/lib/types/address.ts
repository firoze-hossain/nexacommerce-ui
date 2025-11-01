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
    addressZone: 'INSIDE_DHAKA' | 'OUTSIDE_DHAKA' | 'DHAKA_SUBURBS' | 'OTHER_DIVISION';
    isInsideDhaka: boolean;
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
    addressZone: string;
    isInsideDhaka?: boolean;
}

export interface LocationDataResponse {
    dhakaMetroAreas: string[];
    dhakaSuburbanAreas: string[];
    otherCities: string[];
    cityAreas: Record<string, string[]>;
    shippingRates: ShippingRate[];
}

export interface ShippingRate {
    zone: string;
    rate: number;
    deliveryTime: string;
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