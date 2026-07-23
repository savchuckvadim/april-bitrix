'use client';

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
 * отдел → группа → сотрудник. Стекло — класс .glass (см. --fx-glass-*
 * токены, в стеклянных темах эффект усиливается).
 */
export const DepartmentFilterDialog = ({
    open,
    onOpenChange,
}: DepartmentFilterDialogProps) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass flex h-[85vh] w-[min(96vw,56rem)] max-w-none flex-col overflow-hidden sm:max-w-none">
            <DialogHeader>
                <DialogTitle>Настройка фильтра сотрудников</DialogTitle>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-hidden">
                <DepartmentTreeFilter listHeightClass="max-h-[calc(85vh-11rem)]" />
            </div>
        </DialogContent>
    </Dialog>
);
