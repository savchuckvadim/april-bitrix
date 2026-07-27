'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Eye } from 'lucide-react';
import { useAccess } from '@/modules/app';
import { EAccessFeature } from '@/modules/shared/access';
import { ViewAsDialog } from './ViewAsDialog';

/**
 * Кнопка «Смотреть как…» в хедере отчёта. Видна только реальному
 * superuser'у (правило VIEW_AS в shared/access) — в том числе внутри
 * активного режима, иначе из него не переключиться на другого.
 */
export const ViewAsControl = () => {
    const canViewAs = useAccess(EAccessFeature.VIEW_AS);
    const [open, setOpen] = useState(false);

    if (!canViewAs) return null;

    return (
        <>
            <Button
                variant="ghost"
                className="h-8 cursor-pointer gap-1 px-2 text-xs"
                title="Посмотреть отчёт глазами другого сотрудника"
                onClick={() => setOpen(true)}
            >
                <Eye className="h-3.5 w-3.5" />
                Смотреть как…
            </Button>
            <ViewAsDialog open={open} onOpenChange={setOpen} />
        </>
    );
};
