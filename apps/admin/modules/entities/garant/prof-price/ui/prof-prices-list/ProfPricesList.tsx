'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui';
import { CatalogTableLink } from '@/modules/entities/garant/catalog-table';
import {

    useProfPriceFilter,
    useProfPriceList
} from '@/modules/entities/garant/prof-price/lib/hooks';
import { ProfPricesTable } from '@/modules/entities/garant/prof-price/ui/prof-prices-table/ProfPricesTable';
import { ProfPricesFilter } from '@/modules/entities/garant/prof-price/ui/prof-prices-list/components/ProfPricesFilter';
import { DeletePrice } from '../delete-price/DeletePrice';



export function ProfPricesList() {

    const {
        profPrices,
        isLoading,
        deleteDialogOpen,
        complects,
        supplies,
        handleRowClick,
        handleEdit,
        handleDelete,
        confirmDelete,
        toNew,
        setDeleteDialogOpen,
    } = useProfPriceList();
    // Инкапсулированная логика фильтрации
    const {
        filters,
        setSelectedRegions,
        setSelectedSupplyTypes,
        setSelectedComplects,
        setSelectedSupplies,
        filteredProfPrices,
        filterOptions,
    } = useProfPriceFilter(profPrices);


    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold">Цены</h1>
                    <p className="text-muted-foreground text-sm">
                        Здесь правят отдельные цены. Чтобы обновить много
                        сразу — скачайте таблицу, поправьте и загрузите
                        обратно.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <CatalogTableLink kind="prices" />
                    <Button onClick={toNew}>Добавить цену</Button>
                    <DeletePrice type='all' />
                </div>
            </div>

            <ProfPricesFilter
                selectedRegions={filters.selectedRegions}
                onRegionsChange={setSelectedRegions}
                selectedSupplyTypes={filters.selectedSupplyTypes}
                onSupplyTypesChange={setSelectedSupplyTypes}
                selectedComplects={filters.selectedComplects}
                onComplectsChange={setSelectedComplects}
                selectedSupplies={filters.selectedSupplies}
                onSuppliesChange={setSelectedSupplies}
                regionOptions={filterOptions.regionOptions}
                supplyTypeOptions={filterOptions.supplyTypeOptions}
                complectOptions={filterOptions.complectOptions}
                supplyOptions={filterOptions.supplyOptions}
            />

            <ProfPricesTable
                data={filteredProfPrices}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
                complects={complects || []}
                supplies={supplies || []}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот prof price? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
