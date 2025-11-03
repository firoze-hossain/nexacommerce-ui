// app/components/orders/create-manual-order-button.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import CreateManualOrderModal from '@/app/components/orders/create-manual-order-modal';

interface CreateManualOrderButtonProps {
    onOrderCreated?: () => void;
}

export default function CreateManualOrderButton({ onOrderCreated }: CreateManualOrderButtonProps) {
    const [showModal, setShowModal] = useState(false);

    const handleOrderCreated = () => {
        setShowModal(false);
        if (onOrderCreated) {
            onOrderCreated();
        }
    };

    return (
        <>
            <Button
                onClick={() => setShowModal(true)}
                className="bg-green-600 hover:bg-green-700"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Manual Order
            </Button>

            {showModal && (
                <CreateManualOrderModal
                    onClose={() => setShowModal(false)}
                    onOrderCreated={handleOrderCreated}
                />
            )}
        </>
    );
}