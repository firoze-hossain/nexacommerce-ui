// app/lib/types/hero.ts
export interface HeroContent {
    id: number;
    title: string;
    subtitle?: string;
    description?: string;
    backgroundImage: string;
    overlayColor?: string;
    overlayOpacity?: number;
    active: boolean;
    displayOrder: number;
    button1Text?: string;
    button1Url?: string;
    button1Color?: string;
    button2Text?: string;
    button2Url?: string;
    button2Color?: string;
    startDate: string;
    endDate?: string;
    type: 'MAIN_BANNER' | 'PROMOTIONAL' | 'SEASONAL' | 'PRODUCT_HIGHLIGHT' | 'BRAND_SPOTLIGHT' | 'FLASH_SALE';
    targetAudience: 'ALL' | 'GUEST' | 'CUSTOMER' | 'NEW_CUSTOMER' | 'RETURNING_CUSTOMER' | 'VIP_CUSTOMER';
    segmentFilters?: string;
    impressions: number;
    clicks: number;
    conversionRate: number;
    currentlyActive?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface HeroContentCreateRequest {
    title: string;
    subtitle?: string;
    description?: string;
    backgroundImage: string;
    overlayColor?: string;
    overlayOpacity?: number;
    active?: boolean;
    displayOrder: number;
    button1Text?: string;
    button1Url?: string;
    button1Color?: string;
    button2Text?: string;
    button2Url?: string;
    button2Color?: string;
    startDate: string;
    endDate?: string;
    type: string;
    targetAudience: string;
    segmentFilters?: string;
}

export interface HeroContentUpdateRequest {
    title?: string;
    subtitle?: string;
    description?: string;
    backgroundImage?: string;
    overlayColor?: string;
    overlayOpacity?: number;
    active?: boolean;
    displayOrder?: number;
    button1Text?: string;
    button1Url?: string;
    button1Color?: string;
    button2Text?: string;
    button2Url?: string;
    button2Color?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
    targetAudience?: string;
    segmentFilters?: string;
}

export interface HeroContentResponse {
    success: boolean;
    message?: string;
    data: HeroContent;
    timestamp: string;
    statusCode: number;
}

export interface HeroContentsResponse {
    success: boolean;
    message: string;
    data: PaginatedHeroContents;
    timestamp: string;
    statusCode: number;
}

export interface PaginatedHeroContents {
    items: HeroContent[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}

export interface HeroAnalytics {
    heroContentId: number;
    title: string;
    totalImpressions: number;
    totalClicks: number;
    conversionRate: number;
    performanceStatus: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
}

export interface HeroAnalyticsResponse {
    success: boolean;
    message: string;
    data: HeroAnalytics[];
    timestamp: string;
    statusCode: number;
}