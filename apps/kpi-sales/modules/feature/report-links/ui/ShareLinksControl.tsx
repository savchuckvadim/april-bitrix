'use client';

import { Link2, Share2 } from 'lucide-react';
import { HeaderAction } from '@/modules/shared';
import { useReportLinks } from '../model/useReportLinks';
import { ShareLinksDialog } from './ShareLinksDialog';
import { CreateShareLinkDialog } from './CreateShareLinkDialog';

/**
 * Компактный контрол публичных ссылок для хедера отчёта: «Поделиться»
 * создаёт ссылку, кнопка со счётчиком открывает управление всеми ссылками
 * (копирование/обновление/отзыв — в диалоге, хедер не растёт). Обе кнопки —
 * иконки, названия в подсказках; счётчик виден, пока есть действующие ссылки.
 */
export const ShareLinksControl = () => {
    const { activeLinks, setManageOpen, setCreateOpen } = useReportLinks();

    return (
        <>
            {activeLinks.length > 0 && (
                <HeaderAction
                    icon={Link2}
                    label={`Публичные ссылки: ${activeLinks.length}`}
                    hint="Скопировать, обновить или отозвать"
                    count={activeLinks.length}
                    onClick={() => setManageOpen(true)}
                />
            )}
            <HeaderAction
                icon={Share2}
                label="Поделиться"
                hint="Создать публичную ссылку на отчёт"
                onClick={() => setCreateOpen(true)}
            />

            <ShareLinksDialog />
            <CreateShareLinkDialog />
        </>
    );
};
