'use client';

import { Button } from '@workspace/ui/components/button';
import { Link2, Settings2 } from 'lucide-react';
import { useReportLinks } from '../model/useReportLinks';
import { ShareLinksDialog } from './ShareLinksDialog';
import { CreateShareLinkDialog } from './CreateShareLinkDialog';

/**
 * Компактный контрол публичных ссылок для хедера отчёта: «Поделиться»
 * создаёт ссылку, счётчик «Ссылки · N» открывает управление всеми
 * ссылками (копирование/обновление/отзыв — в диалоге, хедер не растёт).
 */
export const ShareLinksControl = () => {
    const { activeLinks, setManageOpen, setCreateOpen } = useReportLinks();

    return (
        <>
            {activeLinks.length > 0 && (
                <Button
                    variant="ghost"
                    className="h-8 cursor-pointer gap-1 px-2 text-xs"
                    title="Управление публичными ссылками"
                    onClick={() => setManageOpen(true)}
                >
                    <Settings2 className="h-3.5 w-3.5" />
                    Ссылки · {activeLinks.length}
                </Button>
            )}
            <Button
                variant="outline"
                className="h-8 cursor-pointer gap-1"
                onClick={() => setCreateOpen(true)}
            >
                <Link2 className="h-3.5 w-3.5" />
                Поделиться
            </Button>

            <ShareLinksDialog />
            <CreateShareLinkDialog />
        </>
    );
};
