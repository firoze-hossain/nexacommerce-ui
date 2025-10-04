// app/lib/types/role.ts
export interface Role {
    id: number;
    name: string;
    description: string;
    permissions: Permission[];
    createdAt: string;
    updatedAt: string;
}

export interface Permission {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface RoleRequest {
    name: string;
    description: string;
    permissionIds: number[];
}

export interface PermissionRequest {
    name: string;
    description: string;
}

export interface RoleResponse {
    success: boolean;
    message: string;
    data: Role;
    timestamp: string;
    statusCode: number;
}

export interface RolesResponse {
    success: boolean;
    message: string;
    data: PaginatedRoles;
    timestamp: string;
    statusCode: number;
}

export interface PermissionResponse {
    success: boolean;
    message: string;
    data: Permission;
    timestamp: string;
    statusCode: number;
}

export interface PermissionsResponse {
    success: boolean;
    message: string;
    data: PaginatedPermissions;
    timestamp: string;
    statusCode: number;
}

export interface PaginatedRoles {
    items: Role[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}

export interface PaginatedPermissions {
    items: Permission[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}

export interface UpdateRolePermissionsRequest {
    permissionIds: number[];
}