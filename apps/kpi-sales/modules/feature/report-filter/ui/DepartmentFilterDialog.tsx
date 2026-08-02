'use client';

import { GlassDialog } from '@workspace/april-ui';
import { DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { DepartmentTreeFilter } from './DepartmentTreeFilter';

interface DepartmentFilterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Полноэкранная настройка фильтра сотрудников: структурное дерево
 * отдел → группа → сотрудник в стеклянной карточке (GlassCard из
 * @workspace/april-ui — читаемое стекло, работает во всех темах).
 */
export const DepartmentFilterDialog = ({
    open,
    onOpenChange,
}: DepartmentFilterDialogProps) => (
    <GlassDialog
        open={open}
        onOpenChange={onOpenChange}
        size="lg"
        overlay="dim"
        className="h-[85vh]"
        cardClassName="h-full overflow-hidden"
    >
        <DialogHeader>
            <DialogTitle>Настройка фильтра сотрудников</DialogTitle>
        </DialogHeader>
        {/* px-1/-mx-1 — запас под 3px focus-ring инпута, иначе overflow-hidden срезает свечение по бокам */}
        <div className="mt-4 -mx-1 min-h-0 flex-1 overflow-hidden px-1">
            <DepartmentTreeFilter listHeightClass="max-h-[calc(85vh-13rem)]" />
        </div>
    </GlassDialog>
);
