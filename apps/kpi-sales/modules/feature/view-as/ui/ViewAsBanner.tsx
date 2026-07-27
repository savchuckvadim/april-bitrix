'use client';

import { Button } from '@workspace/ui/components/button';
import { Eye, X } from 'lucide-react';
import { useAppDispatch, useAppSelector, selectIsViewAs } from '@/modules/app';
import { deactivateViewAs } from '../model/view-as-thunks';
import { headOfLabel } from '../lib/head-of-label.util';

/**
 * Жёлтая плашка активного режима «Смотреть как…»: кто и в какой роли
 * (роль — из перезагруженной структуры), выход — возврат к своей роли.
 * Рендерится в шапке отчёта (ReportProvider).
 */
export const ViewAsBanner = () => {
    const dispatch = useAppDispatch();
    const isViewAs = useAppSelector(selectIsViewAs);
    const user = useAppSelector(s => s.app.viewAs.user);
    const headOf = useAppSelector(s => s.department.currentUser?.headOf);

    if (!isViewAs || !user) return null;

    return (
        <div className="flex items-center gap-2 rounded-md border border-warning/40 bg-warning/15 px-3 py-1.5 text-xs">
            <Eye className="h-3.5 w-3.5 shrink-0 text-warning" />
            <span className="min-w-0 truncate">
                Режим просмотра:{' '}
                <span className="font-medium">
                    {user.LAST_NAME} {user.NAME}
                </span>{' '}
                — {headOfLabel(headOf ?? null)}. Сохранение настроек отключено.
            </span>
            <Button
                variant="outline"
                size="sm"
                className="ml-auto h-6 shrink-0 cursor-pointer gap-1 px-2 text-[11px]"
                onClick={() => dispatch(deactivateViewAs())}
            >
                <X className="h-3 w-3" />
                Выйти
            </Button>
        </div>
    );
};
