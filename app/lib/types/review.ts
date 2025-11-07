// app/lib/types/review.ts
export interface CreateReviewRequest {
    productId: number;
    rating: number;
    comment: string;
    title: string;
}

export interface UpdateReviewRequest {
    rating?: number;
    comment?: string;
    title?: string;
    active?: boolean;
}

export interface ReviewResponse {
    id: number;
    productId: number;
    productName: string;
    customerId: number;
    customerName: string;
    customerProfileImage: string | null;
    rating: number;
    comment: string;
    title: string;
    verifiedPurchase: boolean;
    helpfulCount: number;
    notHelpfulCount: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    userVotedHelpful: boolean | null;
    userVotedNotHelpful: boolean | null;
}

export interface ReviewSummaryResponse {
    averageRating: number;
    totalReviews: number;
    totalRatings: number;
    distribution: RatingDistribution;
}

export interface RatingDistribution {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
}

export interface PaginatedReviews {
    items: ReviewResponse[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}