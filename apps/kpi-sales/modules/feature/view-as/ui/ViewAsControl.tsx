'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { useAccess } from '@/modules/app';
import { HeaderAction } from '@/modules/shared';
import { EAccessFeature } from '@/modules/shared/access';
import { ViewAsDialog } from './ViewAsDialog';

/**
 * Кнопка «Смотреть как…» в хедере отчёта (иконка, название в подсказке).
 * Видна только реальному superuser'у (правило VIEW_AS в shared/access) — в том
 * числе внутри активного режима, иначе из него не переключиться на другого.
 */
export const ViewAsControl = () => {
    const canViewAs = useAccess(EAccessFeature.VIEW_AS);
    const [open, setOpen] = useState(false);

    if (!canViewAs) return null;

    return (
        <>
            <HeaderAction
                icon={Eye}
                label="Смотреть как…"
                hint="Отчёт глазами другого сотрудника"
                onClick={() => setOpen(true)}
            />
            <ViewAsDialog open={open} onOpenChange={setOpen} />
        </>
    );
};
