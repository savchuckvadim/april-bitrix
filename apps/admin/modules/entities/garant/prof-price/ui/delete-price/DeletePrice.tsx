import { useState } from 'react';
import { useDeleteAllProfPrices, useDeleteManyProfPrices, useDeleteProfPrice } from '../../lib/hooks/api-hooks/use-delete-prof-price';
import { ConfirmDialog } from '@/modules/shared';
import { Button } from '@workspace/ui/components';

interface DeletePriceProps {
    ids?: string[];
    id?: string;
    type?: 'single' | 'multiple' | 'all';
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export function DeletePrice({ ids, id, type = 'single' }: DeletePriceProps) {
    const deleteProfPrice = useDeleteProfPrice();
    const deleteManyProfPrices = useDeleteManyProfPrices();
    const deleteAllProfPrices = useDeleteAllProfPrices();
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div>
            <Button variant="destructive" onClick={() => setIsOpen(true)}>
               {type === 'all' ? 'УДАЛИТЬ ВСЁ' : 'Delete'}
            </Button>

            <ConfirmDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                onConfirm={() => {
                    if (type === 'single') {
                        deleteProfPrice.mutate(Number(id));
                    } else if (type === 'multiple') {
                        deleteManyProfPrices.mutate(ids || []);
                    } else if (type === 'all') {
                        deleteAllProfPrices.mutate();
                    }
                }}
                title="Delete Price"
                description="Are you sure you want to delete this price?"
                variant="destructive"
            />
        </div>

    );
}
