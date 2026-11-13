'use client';

import { Download, ImageMinus, ImageUp, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { useFilePick } from '../hooks/use-file-pick';

export interface TemplateCardMenuProps {
    canManage: boolean;
    canManagePreview: boolean;
    onDownload: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onUploadPreview: (file: File) => void;
    onResetPreview: () => void;
}

/** Остальные действия с шаблоном: скачать, править, своё превью, удалить. */
export const TemplateCardMenu = ({
    canManage,
    canManagePreview,
    onDownload,
    onEdit,
    onDelete,
    onUploadPreview,
    onResetPreview,
}: TemplateCardMenuProps) => {
    const pick = useFilePick(onUploadPreview);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="size-8 shrink-0" aria-label="Ещё действия">
                        <MoreHorizontal aria-hidden />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onDownload}>
                        <Download aria-hidden />
                        Скачать DOCX
                    </DropdownMenuItem>
                    {canManage ? (
                        <DropdownMenuItem onClick={onEdit}>
                            <Pencil aria-hidden />
                            Править
                        </DropdownMenuItem>
                    ) : null}
                    {canManagePreview ? (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={pick.open}>
                                <ImageUp aria-hidden />
                                Своё превью…
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onResetPreview}>
                                <ImageMinus aria-hidden />
                                Превью по шаблону
                            </DropdownMenuItem>
                        </>
                    ) : null}
                    {canManage ? (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={onDelete}>
                                <Trash2 aria-hidden />
                                Удалить
                            </DropdownMenuItem>
                        </>
                    ) : null}
                </DropdownMenuContent>
            </DropdownMenu>
            <input
                ref={pick.inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={pick.onChange}
            />
        </>
    );
};
