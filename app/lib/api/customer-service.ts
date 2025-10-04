// app/lib/api/customer-service.ts
import {
    CustomerRegistrationRequest,
    CustomerUpdateRequest,
    CustomerResponse,
    CustomersResponse,
    CustomerWithUserInfo
} from '@/app/lib/types/customer';
import { ApiService } from './api-service';
import {CustomerDetail} from "../types/customer";

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export class CustomerService {
    /**
     * Register a new customer
     */
    static async register(customerData: CustomerRegistrationRequest): Promise<CustomerResponse> {
        const response = await ApiService.post(`${API_BASE_URL}/customers/register`, customerData);
        return response;
    }

    /**
     * Get all customers with pagination (Admin only)
     */
    static async getCustomers(
        page: number = 0,
        size: number = 10,
        sortBy: string = 'createdAt',
        sortDirection: string = 'desc'
    ): Promise<CustomersResponse> {
        const response = await ApiService.get(
            `${API_BASE_URL}/customers?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
        );
        return response;
    }

    /**
     * Get customer by ID
     */
    static async getCustomerById(customerId: number): Promise<CustomerResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/customers/${customerId}`);
        return response;
    }

    /**
     * Get customer by user ID
     */
    static async getCustomerByUserId(userId: number): Promise<CustomerResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/customers/user/${userId}`);
        return response;
    }

    /**
     * Update customer by customer ID (Admin only)
     */
    static async updateCustomer(customerId: number, customerData: CustomerUpdateRequest): Promise<CustomerResponse> {
        const response = await ApiService.put(`${API_BASE_URL}/customers/${customerId}`, customerData);
        return response;
    }

    /**
     * Update customer by user ID (Customer self-update)
     */
    static async updateCustomerByUserId(userId: number, customerData: CustomerUpdateRequest): Promise<CustomerResponse> {
        const response = await ApiService.put(`${API_BASE_URL}/customers/user/${userId}`, customerData);
        return response;
    }

    /**
     * Delete customer (Admin only)
     */
    static async deleteCustomer(customerId: number): Promise<{ success: boolean; message: string }> {
        await ApiService.delete(`${API_BASE_URL}/customers/${customerId}`);
        return { success: true, message: 'Customer deleted successfully' };
    }

    /**
     * Helper method to get customer details with user info
     * This fetches the full customer detail for a given customer ID
     */
    static async getCustomerDetail(customerId: number): Promise<CustomerDetail> {
        const response = await this.getCustomerById(customerId);
        return response.data;
    }
}