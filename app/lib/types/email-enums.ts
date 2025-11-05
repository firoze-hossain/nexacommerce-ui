// app/lib/types/email-enums.ts
// These enums must exactly match the backend Java enums

export enum EmailProvider {
    SMTP = 'SMTP',
    SENDGRID = 'SENDGRID',
    MAILGUN = 'MAILGUN',
    AMAZON_SES = 'AMAZON_SES',
    SENDINBLUE = 'SENDINBLUE',
    POSTMARK = 'POSTMARK',
    GMAIL = 'GMAIL',
    OUTLOOK = 'OUTLOOK',
    CUSTOM = 'CUSTOM'
}

export enum EmailPurpose {
    // Customer Communications
    CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',
    CONTACT_US = 'CONTACT_US',
    HELP_DESK = 'HELP_DESK',

    // Order & Transactional
    ORDER_CONFIRMATION = 'ORDER_CONFIRMATION',
    ORDER_SHIPPED = 'ORDER_SHIPPED',
    ORDER_DELIVERED = 'ORDER_DELIVERED',
    ORDER_CANCELLED = 'ORDER_CANCELLED',
    PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
    REFUND_PROCESSED = 'REFUND_PROCESSED',

    // Account Management
    ACCOUNT_VERIFICATION = 'ACCOUNT_VERIFICATION',
    PASSWORD_RESET = 'PASSWORD_RESET',
    WELCOME_EMAIL = 'WELCOME_EMAIL',
    ACCOUNT_DELETED = 'ACCOUNT_DELETED',

    // Marketing
    NEWSLETTER = 'NEWSLETTER',
    PROMOTIONAL = 'PROMOTIONAL',
    ABANDONED_CART = 'ABANDONED_CART',
    PRODUCT_RECOMMENDATIONS = 'PRODUCT_RECOMMENDATIONS',

    // System & Admin
    SYSTEM_ALERTS = 'SYSTEM_ALERTS',
    SECURITY_NOTIFICATIONS = 'SECURITY_NOTIFICATIONS',
    ADMIN_NOTIFICATIONS = 'ADMIN_NOTIFICATIONS',

    // Vendor Communications
    VENDOR_REGISTRATION = 'VENDOR_REGISTRATION',
    VENDOR_ORDERS = 'VENDOR_ORDERS',
    VENDOR_PAYOUTS = 'VENDOR_PAYOUTS'
}

export enum EmailCategory {
    TRANSACTIONAL = 'TRANSACTIONAL',
    MARKETING = 'MARKETING',
    NOTIFICATION = 'NOTIFICATION',
    SUPPORT = 'SUPPORT',
    SECURITY = 'SECURITY',
    ADMIN = 'ADMIN',
    VENDOR = 'VENDOR'
}

export enum EmailStatus {
    PENDING = 'PENDING',
    SENT = 'SENT',
    DELIVERED = 'DELIVERED',
    FAILED = 'FAILED',
    BOUNCED = 'BOUNCED',
    OPENED = 'OPENED',
    CLICKED = 'CLICKED',
    COMPLAINED = 'COMPLAINED'
}

// Helper functions to get display names
export const getEmailProviderDisplayName = (provider: EmailProvider): string => {
    const displayNames: Record<EmailProvider, string> = {
        [EmailProvider.SMTP]: 'SMTP',
        [EmailProvider.SENDGRID]: 'SendGrid',
        [EmailProvider.MAILGUN]: 'Mailgun',
        [EmailProvider.AMAZON_SES]: 'Amazon SES',
        [EmailProvider.SENDINBLUE]: 'SendinBlue',
        [EmailProvider.POSTMARK]: 'Postmark',
        [EmailProvider.GMAIL]: 'Gmail API',
        [EmailProvider.OUTLOOK]: 'Outlook API',
        [EmailProvider.CUSTOM]: 'Custom API'
    };
    return displayNames[provider] || provider;
};

export const getEmailPurposeDisplayName = (purpose: EmailPurpose): string => {
    const displayNames: Record<EmailPurpose, string> = {
        [EmailPurpose.CUSTOMER_SUPPORT]: 'Customer Support',
        [EmailPurpose.CONTACT_US]: 'Contact Us',
        [EmailPurpose.HELP_DESK]: 'Help Desk',
        [EmailPurpose.ORDER_CONFIRMATION]: 'Order Confirmation',
        [EmailPurpose.ORDER_SHIPPED]: 'Order Shipped',
        [EmailPurpose.ORDER_DELIVERED]: 'Order Delivered',
        [EmailPurpose.ORDER_CANCELLED]: 'Order Cancelled',
        [EmailPurpose.PAYMENT_CONFIRMATION]: 'Payment Confirmation',
        [EmailPurpose.PAYMENT_FAILED]: 'Payment Failed',
        [EmailPurpose.REFUND_PROCESSED]: 'Refund Processed',
        [EmailPurpose.ACCOUNT_VERIFICATION]: 'Account Verification',
        [EmailPurpose.PASSWORD_RESET]: 'Password Reset',
        [EmailPurpose.WELCOME_EMAIL]: 'Welcome Email',
        [EmailPurpose.ACCOUNT_DELETED]: 'Account Deleted',
        [EmailPurpose.NEWSLETTER]: 'Newsletter',
        [EmailPurpose.PROMOTIONAL]: 'Promotional',
        [EmailPurpose.ABANDONED_CART]: 'Abandoned Cart',
        [EmailPurpose.PRODUCT_RECOMMENDATIONS]: 'Product Recommendations',
        [EmailPurpose.SYSTEM_ALERTS]: 'System Alerts',
        [EmailPurpose.SECURITY_NOTIFICATIONS]: 'Security Notifications',
        [EmailPurpose.ADMIN_NOTIFICATIONS]: 'Admin Notifications',
        [EmailPurpose.VENDOR_REGISTRATION]: 'Vendor Registration',
        [EmailPurpose.VENDOR_ORDERS]: 'Vendor Orders',
        [EmailPurpose.VENDOR_PAYOUTS]: 'Vendor Payouts'
    };
    return displayNames[purpose] || purpose;
};

export const getEmailCategoryDisplayName = (category: EmailCategory): string => {
    const displayNames: Record<EmailCategory, string> = {
        [EmailCategory.TRANSACTIONAL]: 'Transactional',
        [EmailCategory.MARKETING]: 'Marketing',
        [EmailCategory.NOTIFICATION]: 'Notification',
        [EmailCategory.SUPPORT]: 'Support',
        [EmailCategory.SECURITY]: 'Security',
        [EmailCategory.ADMIN]: 'Administrative',
        [EmailCategory.VENDOR]: 'Vendor'
    };
    return displayNames[category] || category;
};

export const getEmailStatusDisplayName = (status: EmailStatus): string => {
    const displayNames: Record<EmailStatus, string> = {
        [EmailStatus.PENDING]: 'Pending',
        [EmailStatus.SENT]: 'Sent',
        [EmailStatus.DELIVERED]: 'Delivered',
        [EmailStatus.FAILED]: 'Failed',
        [EmailStatus.BOUNCED]: 'Bounced',
        [EmailStatus.OPENED]: 'Opened',
        [EmailStatus.CLICKED]: 'Clicked',
        [EmailStatus.COMPLAINED]: 'Complained'
    };
    return displayNames[status] || status;
};

// Arrays for dropdowns
export const EMAIL_PROVIDERS = Object.values(EmailProvider);
export const EMAIL_PURPOSES = Object.values(EmailPurpose);
export const EMAIL_CATEGORIES = Object.values(EmailCategory);
export const EMAIL_STATUSES = Object.values(EmailStatus);