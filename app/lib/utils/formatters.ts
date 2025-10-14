// app/lib/utils/formatters.ts
// export const formatCurrency = (amount: number): string => {
//     return new Intl.NumberFormat('en-US', {
//         style: 'currency',
//         currency: 'USD',
//     }).format(amount);
// };

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount).replace('BDT', '৳');
}

export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatRole = (role: string): string => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

export function formatPhoneNumber(phone: string): string {
    // Basic phone formatting - you can enhance this based on your needs
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}

export function formatNumber(number: number): string {
    return new Intl.NumberFormat('en-US').format(number);
}