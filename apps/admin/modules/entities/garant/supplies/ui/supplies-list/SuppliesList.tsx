'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui';
import { CatalogTableLink } from '@/modules/entities/garant/catalog-table';
import { GetSupplyResponseDto } from '@workspace/nest-admin-api';
import { useSupplies } from '../../lib/hooks';
import { SuppliesTable } from '../supplies-table/SuppliesTable';
const path = '/garant/supplies';
export function SuppliesList() {
    const router = useRouter();
    const { data: supplies, isLoading } = useSupplies();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [supplyToDelete, setSupplyToDelete] = React.useState<string | null>(null);

    const handleRowClick = (supply: GetSupplyResponseDto) => {
        router.push(`${path}/${supply.id}`);
    };

    const handleEdit = (supply: GetSupplyResponseDto) => {
        router.push(`${path}/${supply.id}/edit`);
    };

    const handleDelete = (supply: GetSupplyResponseDto) => {
        setSupplyToDelete(supply.id.toString());
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (supplyToDelete) {
            // TODO: Добавьте логику удаления
            setDeleteDialogOpen(false);
            setSupplyToDelete(null);
        }
    };


    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold">Виды поставок</h1>
                    <p className="text-muted-foreground text-sm">
                        Число ОД, коэффициенты и тексты договоров. Много
                        значений сразу удобнее править таблицей.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <CatalogTableLink kind="supplies" />
                    <Button onClick={() => router.push(`${path}/new`)}>
                        Добавить вид поставки
                    </Button>
                </div>
            </div>

            <SuppliesTable
                data={Array.isArray(supplies) ? supplies : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот supply? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
