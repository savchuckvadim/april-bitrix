'use client';

import React from 'react';
import {
    PBX_FIELD_CODES,
    PbxFieldSelectBadge,
} from '@/modules/feature/pbx-fields';
import { DetailsList } from './DetailsList';

interface HotClientDetailsRowProps {
    opHistory: string[];
    /** «ОП История (Комментарии)» — multiple-поле, может быть пустым. */
    opMHistory: string[];
    comments: string[];
    /** Компания сделки — для редактирования её типа клиента (company-поле). */
    companyId: number | null;
    companyClientType: string | null;
}

/**
 * Раскрытая строка горячей сделки: тип клиента компании (редактируемое
 * company-поле op_client_type) + ОП История + комментарии презентаций.
 */
export const HotClientDetailsRow: React.FC<HotClientDetailsRowProps> = ({
    opHistory,
    opMHistory,
    comments,
    companyId,
    companyClientType,
}) => (
    <div className="space-y-3 rounded-md border border-border bg-background-muted p-3">
        {companyId !== null && (
            <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Тип клиента:</span>
                <PbxFieldSelectBadge
                    fieldCode={PBX_FIELD_CODES.opClientType}
                    entityId={companyId}
                    value={companyClientType}
                    emptyLabel="не задан"
                />
            </div>
        )}
        {!opHistory.length && !opMHistory.length && !comments.length ? (
            <p className="py-1 text-sm text-muted-foreground">
                Нет истории и комментариев
            </p>
        ) : (
            <div className="grid gap-4 md:grid-cols-2">
                <DetailsList
                    title="ОП История (Комментарии)"
                    items={opMHistory}
                />
                <DetailsList title="ОП История" items={opHistory} />
                <DetailsList title="Комментарии презентаций" items={comments} />
            </div>
        )}
    </div>
);
