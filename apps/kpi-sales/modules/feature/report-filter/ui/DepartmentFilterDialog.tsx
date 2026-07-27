'use client';

import { GlassCard } from '@workspace/april-ui';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
            className="h-[85vh] w-[min(96vw,56rem)] max-w-none border-none bg-transparent p-0 shadow-none sm:max-w-none"
            // overlayClassName="bg-black/20 backdrop-blur-md"
            overlayClassName="bg-black/30 backdrop-blur-sm"
        >
            <GlassCard
                intensity="liquid"
                className="flex h-full flex-col overflow-hidden p-6"
            >
                <DialogHeader>
                    <DialogTitle>Настройка фильтра сотрудников</DialogTitle>
                </DialogHeader>
                {/* px-1/-mx-1 — запас под 3px focus-ring инпута, иначе overflow-hidden срезает свечение по бокам */}
                <div className="mt-4 -mx-1 min-h-0 flex-1 overflow-hidden px-1">
                    <DepartmentTreeFilter listHeightClass="max-h-[calc(85vh-13rem)]" />
                </div>
            </GlassCard>
        </DialogContent>
    </Dialog>
);
