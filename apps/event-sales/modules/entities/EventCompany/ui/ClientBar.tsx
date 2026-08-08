'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { ProspectScale } from './ProspectScale';
import { ClientStatusChip } from './ClientStatusChip';
import { NoCompanyChip } from './NoCompanyChip';

interface ClientBarProps {
    className?: string;
    /** Тонкая строка шапки: без подписей, значения — в тултипах. */
    compact?: boolean;
}

/**
 * Полоска клиента: прогноз и статус — то, что описывает КЛИЕНТА, а не разговор.
 *
 * Раньше оба поля жили внутри карточки «Итог» рядом со статусом работы. По
 * смыслу они там чужие: итог — про состоявшийся разговор, а прогноз и статус
 * клиента переживают десятки разговоров. Из-за этого карточка отчёта выглядела
 * анкетой из трёх крупных полей.
 *
 * Теперь это одна строка, которую видно и над списком событий, и в шапке
 * отчёта: прогноз можно поправить, не открывая отчёт вовсе.
 */
export const ClientBar: FC<ClientBarProps> = ({ className, compact }) => (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1', className)}>
        <ProspectScale compact={compact} />
        <ClientStatusChip />
        {/* Без компании оба контрола выше молча гаснут — чип объясняет почему. */}
        <NoCompanyChip />
    </div>
);
