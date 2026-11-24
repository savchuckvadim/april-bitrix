'use client';

import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';
import {
    PROVIDER_IMAGE_LEGACY_TEXT,
    type LegacyImportTotalsItem,
    type ProviderImageLegacyStatus,
} from '@/modules/entities/portal-provider/provider-image';
import { LEGACY_IMPORT_TONE_CLASS } from '../lib/legacy-import-tone.consts';

interface LegacyImportTotalsProps {
    items: readonly LegacyImportTotalsItem[];
    totalRows: number;
    activeStatus: ProviderImageLegacyStatus | null;
    onToggle: (status: ProviderImageLegacyStatus) => void;
    onClear: () => void;
}

/** Итоги отчёта: плашки по статусам с числом строк. Нажатие оставляет в таблице только этот статус. */
export function LegacyImportTotals({
    items,
    totalRows,
    activeStatus,
    onToggle,
    onClear,
}: LegacyImportTotalsProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Badge asChild variant="outline" className={cn(activeStatus === null && 'ring-2 ring-ring')}>
                <button type="button" aria-pressed={activeStatus === null} onClick={onClear}>
                    {PROVIDER_IMAGE_LEGACY_TEXT.filterAll}: {totalRows}
                </button>
            </Badge>
            {items.map((item) => (
                <Badge
                    asChild
                    key={item.status}
                    variant="outline"
                    className={cn(
                        LEGACY_IMPORT_TONE_CLASS[item.tone],
                        item.count === 0 && 'opacity-50',
                        activeStatus === item.status && 'ring-2 ring-ring',
                    )}
                >
                    <button
                        type="button"
                        disabled={item.count === 0}
                        aria-pressed={activeStatus === item.status}
                        onClick={() => onToggle(item.status)}
                    >
                        {item.label}: {item.count}
                    </button>
                </Badge>
            ))}
        </div>
    );
}
