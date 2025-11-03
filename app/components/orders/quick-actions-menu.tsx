// app/components/orders/quick-actions-menu.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Order } from '@/app/lib/types/order';

interface QuickActionsMenuProps {
    order: Order;
    onStatusUpdate: (orderId: number, status: string, notes?: string) => void;
    onPaymentStatusUpdate: (orderId: number, status: string, notes?: string) => void;
    onRefund: (orderId: number, amount: number, reason: string) => void;
    isAdmin: boolean;
}

export default function QuickActionsMenu({
                                             order,
                                             onStatusUpdate,
                                             onPaymentStatusUpdate,
                                             onRefund,
                                             isAdmin
                                         }: QuickActionsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundAmount, setRefundAmount] = useState(order.finalAmount);
    const [refundReason, setRefundReason] = useState('');

    const handleRefund = () => {
        onRefund(order.id, refundAmount, refundReason);
        setShowRefundModal(false);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
            >
                Actions
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="p-2 space-y-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => window.open(`/dashboard/orders/${order.id}`, '_blank')}
                        >
                            View Details
                        </Button>

                        {isAdmin && (
                            <>
                                <div className="border-t border-gray-200 my-1"></div>

                                <div className="px-2 py-1 text-xs font-medium text-gray-500">
                                    Status Actions
                                </div>

                                {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-green-600"
                                        onClick={() => onStatusUpdate(order.id, 'DELIVERED')}
                                    >
                                        Mark as Delivered
                                    </Button>
                                )}

                                {order.status !== 'CANCELLED' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-red-600"
                                        onClick={() => onStatusUpdate(order.id, 'CANCELLED')}
                                    >
                                        Cancel Order
                                    </Button>
                                )}

                                {order.paymentStatus === 'PAID' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-orange-600"
                                        onClick={() => setShowRefundModal(true)}
                                    >
                                        Process Refund
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Refund Modal */}
            {showRefundModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold mb-4">Process Refund</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Refund Amount
                                </label>
                                <input
                                    type="number"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    max={order.finalAmount}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason
                                </label>
                                <textarea
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    rows={3}
                                    placeholder="Reason for refund..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setShowRefundModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleRefund}
                                className="bg-orange-600 hover:bg-orange-700"
                            >
                                Process Refund
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}