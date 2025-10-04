export interface User {
    id: number;
    name: string;
    email: string;
    role: {
        id: number;
        name: string;
        description: string;
        permissions: Permission[];
        createdAt: string;
        updatedAt: string;
    };
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserResponse {
    id: number;
    name: string;
    email: string;
    role: {
        id: number;
        name: string;
        description: string;
        permissions: Permission[];
        createdAt: string;
        updatedAt: string;
    };
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserRequest {
    name: string;
    email: string;
    password: string;
    roleId: number;
    active?: boolean;
}

export interface Permission {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedUsers {
    items: User[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}

export interface UsersResponse {
    success: boolean;
    message: string;
    data: PaginatedUsers;
    timestamp: string;
    statusCode: number;
}

export interface UserResponseSingle {
    success: boolean;
    message: string;
    data: User;
    timestamp: string;
    statusCode: number;
}