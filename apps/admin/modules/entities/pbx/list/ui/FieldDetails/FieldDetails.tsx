'use client';

import * as React from 'react';
import { DetailLine } from '../../../lib/ui';
import { buildItemsMatrix, type ItemMatrixRow } from '../../lib/items-matrix';
import type { ListFieldRow } from '../../model';
import { ItemsMatrix } from './components/ItemsMatrix';

/**
 * Детали поля с трёх сторон: эталон (шаблон) × Bitrix (свойство) × PortalDB
 * (зеркало). Ниже — матрица значений enum-поля с точечными операциями.
 */
export function FieldDetails({
    row,
    onEditItem,
    onDeleteItem,
    itemsBusy,
}: {
    row: ListFieldRow;
    /** Переименовать значение enum-поля (PortalDB + Bitrix). */
    onEditItem: (item: ItemMatrixRow) => void;
    /** Удалить значение enum-поля (PortalDB + Bitrix). */
    onDeleteItem: (item: ItemMatrixRow) => void;
    itemsBusy?: boolean;
}) {
    const items = React.useMemo(() => buildItemsMatrix(row), [row]);

    return (
        <div className="space-y-4 p-3 text-xs">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1 rounded-md border p-3">
                    <p className="font-semibold">Эталон (шаблон)</p>
                    <DetailLine label="name" value={row.name} />
                    <DetailLine label="code" value={row.code} />
                    <DetailLine label="полный CODE" value={row.fullCode} />
                    <DetailLine label="btx-код" value={row.bxFieldName} />
                    <DetailLine label="type" value={row.type} />
                    <DetailLine
                        label="items"
                        value={row.templateItems.length || '—'}
                    />
                </div>

                <div className="space-y-1 rounded-md border p-3">
                    <p className="font-semibold">Bitrix</p>
                    {row.bitrix ? (
                        <>
                            <DetailLine
                                label="FIELD_ID"
                                value={row.bitrix.fieldId}
                            />
                            <DetailLine label="CODE" value={row.bitrix.code} />
                            <DetailLine label="name" value={row.bitrix.name} />
                            <DetailLine label="type" value={row.bitrix.type} />
                            <DetailLine
                                label="multiple"
                                value={row.bitrix.multiple ? 'Да' : 'Нет'}
                            />
                            <DetailLine
                                label="required"
                                value={row.bitrix.isRequired ? 'Да' : 'Нет'}
                            />
                            <DetailLine label="sort" value={row.bitrix.sort} />
                            <DetailLine
                                label="items"
                                value={row.bitrix.items.length || '—'}
                            />
                        </>
                    ) : (
                        <p className="text-muted-foreground">
                            Свойство не найдено в инфоблоке.
                        </p>
                    )}
                </div>

                <div className="space-y-1 rounded-md border p-3">
                    <p className="font-semibold">PortalDB</p>
                    {row.db ? (
                        <>
                            <DetailLine label="id" value={row.db.id} />
                            <DetailLine label="code" value={row.db.code} />
                            <DetailLine
                                label="bitrixId"
                                value={row.db.bitrixId}
                            />
                            <DetailLine
                                label="bitrixCamelId"
                                value={row.db.bitrixCamelId}
                            />
                            <DetailLine label="type" value={row.db.type} />
                            <DetailLine
                                label="isPlural"
                                value={row.db.isPlural ? 'Да' : 'Нет'}
                            />
                            <DetailLine
                                label="items"
                                value={row.db.items.length || '—'}
                            />
                        </>
                    ) : (
                        <p className="text-muted-foreground">
                            Зеркала в `bitrixfields` нет — интеграции это поле
                            не увидят.
                        </p>
                    )}
                </div>
            </div>

            {items.length > 0 && (
                <div className="space-y-2">
                    <p className="font-semibold">
                        Значения (эталон × Bitrix × PortalDB)
                    </p>
                    <ItemsMatrix
                        rows={items}
                        busy={itemsBusy}
                        onEdit={onEditItem}
                        onDelete={onDeleteItem}
                    />
                </div>
            )}
        </div>
    );
}
