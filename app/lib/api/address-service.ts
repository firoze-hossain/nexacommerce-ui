// app/lib/api/address-service.ts
import {ApiService} from './api-service';
import {Address, AddressRequest, LocationDataResponse} from '@/app/lib/types/address';

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export class AddressService {
    static async getMyAddresses(): Promise<{ success: boolean; message: string; data: Address[] }> {
        const response = await ApiService.get(`${API_BASE_URL}/addresses/users/current`);
        return response;
    }

    static async getAddressById(addressId: number): Promise<{ success: boolean; message: string; data: Address }> {
        const response = await ApiService.get(`${API_BASE_URL}/addresses/${addressId}`);
        return response;
    }

    // static async createAddress(request: AddressRequest): Promise<{ success: boolean; message: string; data: Address }> {
    //     const response = await ApiService.post(`${API_BASE_URL}/addresses/users/current`, request);
    //     return response;
    // }
    // static async createAddress(request: AddressRequest): Promise<{ success: boolean; message: string; data: Address }> {
    //     console.log('Creating address with data:', request);
    //
    //     const response = await ApiService.post(`${API_BASE_URL}/addresses/users/current`, request);
    //
    //     console.log('Address creation response:', response);
    //     return response;
    // }
    static async createAddress(request: AddressRequest): Promise<{ success: boolean; message: string; data: Address }> {
        console.log('=== ADDRESS CREATION DEBUG ===');
        console.log('Request payload:', JSON.stringify(request, null, 2));
        console.log('API URL:', `${API_BASE_URL}/addresses/users/current`);

        try {
            const response = await ApiService.post(`${API_BASE_URL}/addresses/users/current`, request);
            console.log('Response:', response);
            return response;
        } catch (error) {
            console.error('Error details:', error);
            throw error;
        }
    }

    static async updateAddress(addressId: number, request: AddressRequest): Promise<{
        success: boolean;
        message: string;
        data: Address
    }> {
        const response = await ApiService.put(`${API_BASE_URL}/addresses/${addressId}`, request);
        return response;
    }

    static async deleteAddress(addressId: number): Promise<{ success: boolean; message: string }> {
        const response = await ApiService.delete(`${API_BASE_URL}/addresses/${addressId}`);
        return response;
    }

    static async setDefaultAddress(addressId: number): Promise<{ success: boolean; message: string; data: Address }> {
        const response = await ApiService.patch(`${API_BASE_URL}/addresses/${addressId}/default`);
        return response;
    }

    static async getAddressesByType(addressType: string): Promise<{
        success: boolean;
        message: string;
        data: Address[]
    }> {
        const response = await ApiService.get(`${API_BASE_URL}/addresses/users/current/type/${addressType}`);
        return response;
    }

    static async getDefaultAddress(): Promise<{ success: boolean; message: string; data: Address }> {
        const response = await ApiService.get(`${API_BASE_URL}/addresses/users/current/default`);
        return response;
    }

    static async getPopularAreas(): Promise<{ success: boolean; message: string; data: string[] }> {
        const response = await ApiService.get(`${API_BASE_URL}/addresses/bangladesh/areas`);
        return response;
    }

    static async getBangladeshCities(): Promise<{ success: boolean; message: string; data: string[] }> {
        const response = await ApiService.get(`${API_BASE_URL}/addresses/bangladesh/cities`);
        return response;
    }

    static async getLocationData(): Promise<{ success: boolean; message: string; data: LocationDataResponse }> {
        const response = await ApiService.get(`${API_BASE_URL}/addresses/bangladesh/location-data`);
        return response;
    }
}