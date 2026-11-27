'use client';

import { Archive, ArchiveRestore, MoreHorizontal, Star, StarOff, Trash2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';

export interface InvoiceTemplateRowMenuProps {
    isDefault: boolean;
    isArchived: boolean;
    disabled: boolean;
    onToggleDefault: () => void;
    onToggleArchive: () => void;
    onDelete: () => void;
}

/** Остальные действия со строкой: по умолчанию, архив, удаление. */
export const InvoiceTemplateRowMenu = ({
    isDefault,
    isArchived,
    disabled,
    onToggleDefault,
    onToggleArchive,
    onDelete,
}: InvoiceTemplateRowMenuProps) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button
                variant="ghost"
                size="icon"
                className="size-6 [&>svg]:size-3.5"
                aria-label="Ещё действия"
                disabled={disabled}
            >
                <MoreHorizontal aria-hidden />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            {isArchived ? null : (
                <DropdownMenuItem onClick={onToggleDefault}>
                    {isDefault ? <StarOff aria-hidden /> : <Star aria-hidden />}
                    {isDefault ? 'Снять «по умолчанию»' : 'Сделать по умолчанию'}
                </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onToggleArchive}>
                {isArchived ? <ArchiveRestore aria-hidden /> : <Archive aria-hidden />}
                {isArchived ? 'Из архива' : 'В архив'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2 aria-hidden />
                Удалить
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);
