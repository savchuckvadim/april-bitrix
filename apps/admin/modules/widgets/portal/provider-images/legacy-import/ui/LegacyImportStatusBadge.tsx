'use client';

import { Badge } from '@workspace/ui/components/badge';
import {
    PROVIDER_IMAGE_LEGACY_STATUS_TONE,
    legacyStatusLabel,
    type ProviderImageLegacyStatus,
} from '@/modules/entities/portal-provider/provider-image';
import { LEGACY_IMPORT_TONE_CLASS } from '../lib/legacy-import-tone.consts';

interface LegacyImportStatusBadgeProps {
    status: ProviderImageLegacyStatus;
}

/** Плашка статуса строки отчёта: подпись по-русски, цвет по тону статуса. */
export function LegacyImportStatusBadge({ status }: LegacyImportStatusBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={LEGACY_IMPORT_TONE_CLASS[PROVIDER_IMAGE_LEGACY_STATUS_TONE[status]]}
        >
            {legacyStatusLabel(status)}
        </Badge>
    );
}
