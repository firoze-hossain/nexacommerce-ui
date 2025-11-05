// app/lib/api/email-service.ts
import {
    EmailConfiguration,
    EmailTemplate,
    EmailLog,
    EmailTracking,
    EmailAnalytics,
    EmailConfigurationRequest,
    EmailTemplateRequest,
    SendEmailRequest,
    EmailConfigurationResponse,
    EmailConfigurationsResponse,
    EmailTemplateResponse,
    EmailTemplatesResponse,
    EmailLogResponse,
    EmailLogsResponse,
    EmailAnalyticsResponse
} from '@/app/lib/types/email';
import { ApiService } from './api-service';

const API_BASE_URL = 'http://localhost:8090/api/v1/nexa';

export class EmailService {
    // Email Configurations
    static async getConfigurations(
        page: number = 0,
        size: number = 20
    ): Promise<EmailConfigurationsResponse> {
        const response = await ApiService.get(
            `${API_BASE_URL}/emails/configurations?page=${page}&size=${size}`
        );
        return response;
    }

    static async getConfigurationById(id: number): Promise<EmailConfigurationResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/emails/configurations/${id}`);
        return response;
    }

    static async createConfiguration(configData: EmailConfigurationRequest): Promise<EmailConfigurationResponse> {
        const response = await ApiService.post(`${API_BASE_URL}/emails/configurations`, configData);
        return response;
    }

    static async updateConfiguration(id: number, configData: EmailConfigurationRequest): Promise<EmailConfigurationResponse> {
        const response = await ApiService.put(`${API_BASE_URL}/emails/configurations/${id}`, configData);
        return response;
    }

    static async deleteConfiguration(id: number): Promise<{ success: boolean; message: string }> {
        await ApiService.delete(`${API_BASE_URL}/emails/configurations/${id}`);
        return { success: true, message: 'Configuration deleted successfully' };
    }

    static async activateConfiguration(id: number): Promise<EmailConfigurationResponse> {
        const response = await ApiService.post(`${API_BASE_URL}/emails/configurations/${id}/activate`, {});
        return response;
    }

    static async setAsDefault(id: number): Promise<EmailConfigurationResponse> {
        const response = await ApiService.post(`${API_BASE_URL}/emails/configurations/${id}/default`, {});
        return response;
    }

    // Email Templates
    // static async getTemplates(
    //     page: number = 0,
    //     size: number = 20
    // ): Promise<EmailTemplatesResponse> {
    //     const response = await ApiService.get(
    //         `${API_BASE_URL}/emails/templates?page=${page}&size=${size}`
    //     );
    //     return response;
    // }
    static async getTemplates(
        page: number = 0,
        size: number = 20
    ): Promise<EmailTemplatesResponse> {
        try {
            const response = await ApiService.get(
                `${API_BASE_URL}/emails/templates?page=${page}&size=${size}`
            );

            // Check if response.data is already an array (direct response)
            if (Array.isArray(response.data)) {
                // Transform array response to paginated structure
                return {
                    ...response,
                    data: {
                        items: response.data,
                        totalItems: response.data.length,
                        currentPage: page,
                        pageSize: size,
                        totalPages: Math.ceil(response.data.length / size)
                    }
                };
            }

            // If it's already paginated, return as is
            return response;
        } catch (error) {
            console.error('Error in getTemplates:', error);
            throw error;
        }
    }

    static async getTemplateById(id: number): Promise<EmailTemplateResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/emails/templates/${id}`);
        return response;
    }

    static async getTemplateByKey(templateKey: string): Promise<EmailTemplateResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/emails/templates/key/${templateKey}`);
        return response;
    }

    static async createTemplate(templateData: EmailTemplateRequest): Promise<EmailTemplateResponse> {
        const response = await ApiService.post(`${API_BASE_URL}/emails/templates`, templateData);
        return response;
    }

    static async updateTemplate(id: number, templateData: EmailTemplateRequest): Promise<EmailTemplateResponse> {
        const response = await ApiService.put(`${API_BASE_URL}/emails/templates/${id}`, templateData);
        return response;
    }

    static async deleteTemplate(id: number): Promise<{ success: boolean; message: string }> {
        await ApiService.delete(`${API_BASE_URL}/emails/templates/${id}`);
        return { success: true, message: 'Template deleted successfully' };
    }

    static async activateTemplate(id: number): Promise<EmailTemplateResponse> {
        const response = await ApiService.post(`${API_BASE_URL}/emails/templates/${id}/activate`, {});
        return response;
    }

    static async deactivateTemplate(id: number): Promise<EmailTemplateResponse> {
        const response = await ApiService.post(`${API_BASE_URL}/emails/templates/${id}/deactivate`, {});
        return response;
    }

    // Email Logs
    static async getEmailLogs(
        page: number = 0,
        size: number = 20
    ): Promise<EmailLogsResponse> {
        const response = await ApiService.get(
            `${API_BASE_URL}/emails/logs?page=${page}&size=${size}`
        );
        return response;
    }

    static async getEmailLogsByStatus(status: string): Promise<EmailLogsResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/emails/logs/status/${status}`);
        return response;
    }

    static async getEmailLogsByPurpose(purpose: string): Promise<EmailLogsResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/emails/logs/purpose/${purpose}`);
        return response;
    }

    static async getEmailLogById(id: number): Promise<EmailLogResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/emails/logs/${id}`);
        return response;
    }

    // Email Sending
    static async sendEmail(emailData: SendEmailRequest): Promise<EmailLogResponse> {
        const response = await ApiService.post(`${API_BASE_URL}/emails/send`, emailData);
        return response;
    }

    static async sendTemplatedEmail(
        to: string,
        templateKey: string,
        purpose: string,
        variables?: Record<string, any>
    ): Promise<EmailLogResponse> {
        const response = await ApiService.post(`${API_BASE_URL}/emails/send/templated`, {
            to,
            templateKey,
            purpose,
            variables: variables || {}
        });
        return response;
    }

    static async retryFailedEmails(): Promise<{ success: boolean; message: string }> {
        await ApiService.post(`${API_BASE_URL}/emails/retry-failed`, {});
        return { success: true, message: 'Failed emails retry process started' };
    }

    // Analytics
    static async getAnalytics(): Promise<EmailAnalyticsResponse> {
        const response = await ApiService.get(`${API_BASE_URL}/emails/analytics`);
        return response;
    }
}