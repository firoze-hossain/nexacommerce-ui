// app/lib/types/email.ts
import {
    EmailProvider,
    EmailPurpose,
    EmailCategory,
    EmailStatus
} from './email-enums';

export interface EmailConfiguration {
    id: number;
    configName: string;
    purpose: EmailPurpose;
    fromEmail: string;
    fromName: string;
    provider: EmailProvider;
    host: string;
    port: number;
    username: string;
    useTls: boolean;
    useSsl: boolean;
    encryptionType: string;
    domain: string;
    region: string;
    isActive: boolean;
    isDefault: boolean;
    maxRetries: number;
    timeoutMs: number;
    rateLimitPerHour: number;
    templateId: string;
    createdAt: string;
    updatedAt: string;
}

export interface EmailTemplate {
    id: number;
    name: string;
    templateKey: string;
    category: EmailCategory;
    subject: string;
    preheader: string;
    htmlContent: string;
    textContent: string;
    language: string;
    isActive: boolean;
    isSystemTemplate: boolean;
    templateVersion: number;
    supportedPurposes: string[];
    availableVariables: Record<string, string>;
    defaultVariables: Record<string, any>;
    defaultConfiguration: EmailConfiguration;
    createdAt: string;
    updatedAt: string;
}

export interface EmailLog {
    id: number;
    emailConfiguration: EmailConfiguration;
    emailTemplate: EmailTemplate;
    purpose: EmailPurpose;
    recipientEmail: string;
    recipientName: string;
    subject: string;
    content: string;
    status: EmailStatus;
    messageId: string;
    sentAt: string;
    deliveredAt: string;
    openedAt: string;
    errorMessage: string;
    retryCount: number;
    trackingToken: string;
    isTracked: boolean;
    createdAt: string;
}

export interface EmailTracking {
    id: number;
    emailLogId: number;
    trackingToken: string;
    openedAt: string;
    clickedAt: string;
    ipAddress: string;
    userAgent: string;
    country: string;
    city: string;
    clickUrl: string;
    clickCount: number;
    deviceType: string;
    browser: string;
    platform: string;
    createdAt: string;
}

export interface EmailAnalytics {
    totalEmails: number;
    sentEmails: number;
    deliveredEmails: number;
    openedEmails: number;
    clickedEmails: number;
    failedEmails: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    emailsByPurpose: Record<string, number>;
    emailsByStatus: Record<string, number>;
    opensByDevice: Record<string, number>;
    clicksByUrl: Record<string, number>;
}

// Request DTOs
export interface EmailConfigurationRequest {
    configName: string;
    purpose: EmailPurpose;
    fromEmail: string;
    fromName: string;
    provider: EmailProvider;
    host: string;
    port: number;
    username: string;
    password: string;
    useTls: boolean;
    useSsl: boolean;
    encryptionType: string;
    apiKey: string;
    apiSecret: string;
    domain: string;
    region: string;
    isActive: boolean;
    isDefault: boolean;
    maxRetries: number;
    timeoutMs: number;
    rateLimitPerHour: number;
    templateId: string;
    templateData: string;
    customHeaders: string;
}

export interface EmailTemplateRequest {
    name: string;
    templateKey: string;
    category: EmailCategory;
    subject: string;
    preheader: string;
    htmlContent: string;
    textContent: string;
    language: string;
    isActive: boolean;
    isSystemTemplate: boolean;
    supportedPurposes: EmailPurpose[];
    availableVariables: Record<string, string>;
    defaultVariables: Record<string, any>;
    defaultConfigurationId: number;
}

export interface SendEmailRequest {
    to: string;
    toName: string;
    subject: string;
    content: string;
    purpose: EmailPurpose;
    templateKey: string;
    templateVariables: Record<string, any>;
    configurationId: number;
    templateId: number;
    isHtml: boolean;
    replyTo: string;
    cc: string;
    bcc: string;
}

// Response DTOs
export interface EmailConfigurationResponse {
    success: boolean;
    message: string;
    data: EmailConfiguration;
    timestamp: string;
    statusCode: number;
}

export interface EmailConfigurationsResponse {
    success: boolean;
    message: string;
    data: PaginatedEmailConfigurations;
    timestamp: string;
    statusCode: number;
}

export interface EmailTemplateResponse {
    success: boolean;
    message: string;
    data: EmailTemplate;
    timestamp: string;
    statusCode: number;
}

export interface EmailTemplatesResponse {
    success: boolean;
    message: string;
    data: PaginatedEmailTemplates;
    timestamp: string;
    statusCode: number;
}

export interface EmailLogResponse {
    success: boolean;
    message: string;
    data: EmailLog;
    timestamp: string;
    statusCode: number;
}

export interface EmailLogsResponse {
    success: boolean;
    message: string;
    data: PaginatedEmailLogs;
    timestamp: string;
    statusCode: number;
}

export interface EmailAnalyticsResponse {
    success: boolean;
    message: string;
    data: EmailAnalytics;
    timestamp: string;
    statusCode: number;
}

// Pagination types
export interface PaginatedEmailConfigurations {
    items: EmailConfiguration[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}

export interface PaginatedEmailTemplates {
    items: EmailTemplate[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}

export interface PaginatedEmailLogs {
    items: EmailLog[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}