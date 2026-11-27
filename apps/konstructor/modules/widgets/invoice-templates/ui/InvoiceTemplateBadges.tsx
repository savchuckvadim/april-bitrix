'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import type { InvoiceTemplate } from '@/modules/entities/invoice-template';

export interface InvoiceTemplateBadgesProps {
    template: Pick<InvoiceTemplate, 'isDefault' | 'isActive' | 'isArchived'>;
}

/** Отметки шаблона: по умолчанию, выключен, в архиве. */
export const InvoiceTemplateBadges = ({ template }: InvoiceTemplateBadgesProps) => (
    <div className="flex flex-wrap gap-1">
        {template.isDefault ? (
            <ToneBadge
                tone="success"
                variant="soft"
                size="sm"
                title="По умолчанию в своей группе: той же привязки и того же поставщика"
            >
                По умолчанию
            </ToneBadge>
        ) : null}
        {!template.isActive && !template.isArchived ? (
            <ToneBadge
                tone="muted"
                variant="soft"
                size="sm"
                title="Выключенный шаблон не участвует в подборе"
            >
                Выключен
            </ToneBadge>
        ) : null}
        {template.isArchived ? (
            <ToneBadge tone="muted" variant="outline" size="sm">
                Архив
            </ToneBadge>
        ) : null}
    </div>
);
