'use client';

import { DetailLine } from '../../../lib/ui';
import type { ListRow } from '../../model';

/**
 * Детали списка с трёх сторон: эталон (Excel-шаблон) × Bitrix (инфоблок,
 * `lists.get`) × PortalDB (строка `bitrixlists`). Даёт увидеть фактический
 * IBLOCK_CODE/NAME в Bitrix и код, записанный в БД.
 */
export function ListDetails({ row }: { row: ListRow }) {
    return (
        <div className="grid grid-cols-1 gap-4 p-3 text-xs md:grid-cols-3">
            <div className="space-y-1 rounded-md border p-3">
                <p className="font-semibold">Эталон (шаблон)</p>
                <DetailLine label="name" value={row.name} />
                <DetailLine label="code (IBLOCK_CODE)" value={row.code} />
                <DetailLine label="type" value={row.type} />
                <DetailLine label="group" value={row.group} />
                <DetailLine
                    label="шаблон"
                    value={`${row.sourceListName}/${row.sourceGroup}`}
                />
            </div>

            <div className="space-y-1 rounded-md border p-3">
                <p className="font-semibold">Bitrix</p>
                {row.bitrix ? (
                    <>
                        <DetailLine label="IBLOCK_ID" value={row.bitrix.id} />
                        <DetailLine label="CODE" value={row.bitrix.code} />
                        <DetailLine label="NAME" value={row.bitrix.name} />
                        <DetailLine
                            label="IBLOCK_TYPE_ID"
                            value={row.bitrix.iblockTypeId}
                        />
                        <DetailLine
                            label="DESCRIPTION"
                            value={row.bitrix.description || '—'}
                        />
                        <DetailLine label="SORT" value={row.bitrix.sort} />
                        <DetailLine
                            label="ACTIVE"
                            value={
                                row.bitrix.active === null
                                    ? '—'
                                    : row.bitrix.active
                                      ? 'Да'
                                      : 'Нет'
                            }
                        />
                    </>
                ) : (
                    <p className="text-muted-foreground">
                        Инфоблок не найден в Bitrix (`lists.get`).
                    </p>
                )}
            </div>

            <div className="space-y-1 rounded-md border p-3">
                <p className="font-semibold">PortalDB</p>
                {row.db ? (
                    <>
                        <DetailLine label="id" value={row.db.id} />
                        <DetailLine label="code" value={row.db.code} />
                        <DetailLine label="name" value={row.db.name} />
                        <DetailLine label="title" value={row.db.title} />
                        <DetailLine
                            label="bitrixId (IBLOCK_ID)"
                            value={row.db.bitrixId}
                        />
                    </>
                ) : (
                    <p className="text-muted-foreground">
                        Зеркала в `bitrixlists` нет — интеграции этот список не
                        увидят.
                    </p>
                )}
            </div>
        </div>
    );
}
