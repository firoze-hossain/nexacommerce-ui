// app/components/orders/order-status-badge.tsx
interface OrderStatusBadgeProps {
    status: string;
    size?: 'sm' | 'md' | 'lg';
}

export function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base'
    };

    const statusConfig = {
        PENDING: {
            color: 'bg-yellow-100 text-yellow-800',
            icon: '⏳'
        },
        CONFIRMED: {
            color: 'bg-blue-100 text-blue-800',
            icon: '✅'
        },
        PROCESSING: {
            color: 'bg-purple-100 text-purple-800',
            icon: '🔄'
        },
        SHIPPED: {
            color: 'bg-indigo-100 text-indigo-800',
            icon: '🚚'
        },
        DELIVERED: {
            color: 'bg-green-100 text-green-800',
            icon: '📦'
        },
        CANCELLED: {
            color: 'bg-red-100 text-red-800',
            icon: '❌'
        },
        REFUNDED: {
            color: 'bg-gray-100 text-gray-800',
            icon: '💸'
        }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
        <span className={`inline-flex items-center ${sizeClasses[size]} rounded-full font-medium ${config.color}`}>
            <span className="mr-1">{config.icon}</span>
            {status}
        </span>
    );
}

// app/components/orders/payment-status-badge.tsx
interface PaymentStatusBadgeProps {
    status: string;
    size?: 'sm' | 'md' | 'lg';
}

export function PaymentStatusBadge({ status, size = 'md' }: PaymentStatusBadgeProps) {
    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base'
    };

    const statusConfig = {
        PENDING: {
            color: 'bg-yellow-100 text-yellow-800',
            icon: '⏳'
        },
        PAID: {
            color: 'bg-green-100 text-green-800',
            icon: '✅'
        },
        FAILED: {
            color: 'bg-red-100 text-red-800',
            icon: '❌'
        },
        REFUNDED: {
            color: 'bg-gray-100 text-gray-800',
            icon: '💸'
        },
        PROCESSING: {
            color: 'bg-blue-100 text-blue-800',
            icon: '🔄'
        }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
        <span className={`inline-flex items-center ${sizeClasses[size]} rounded-full font-medium ${config.color}`}>
            <span className="mr-1">{config.icon}</span>
            {status}
        </span>
    );
}