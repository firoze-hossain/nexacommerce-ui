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
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            icon: '⏳',
            label: 'Pending'
        },
        PAID: {
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: '✅',
            label: 'Paid'
        },
        FAILED: {
            color: 'bg-red-100 text-red-800 border-red-200',
            icon: '❌',
            label: 'Failed'
        },
        REFUNDED: {
            color: 'bg-gray-100 text-gray-800 border-gray-200',
            icon: '💸',
            label: 'Refunded'
        },
        PROCESSING: {
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: '🔄',
            label: 'Processing'
        },
        PARTIALLY_REFUNDED: {
            color: 'bg-orange-100 text-orange-800 border-orange-200',
            icon: '↩️',
            label: 'Partially Refunded'
        },
        CANCELLED: {
            color: 'bg-red-100 text-red-800 border-red-200',
            icon: '🚫',
            label: 'Cancelled'
        }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
        <span
            className={`inline-flex items-center ${sizeClasses[size]} rounded-full font-medium border ${config.color}`}
            title={`Payment Status: ${config.label}`}
        >
            <span className="mr-1">{config.icon}</span>
            {config.label}
        </span>
    );
}