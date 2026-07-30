'use client';

import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { ExternalLink } from 'lucide-react';

/**
 * Поле с готовой публичной ссылкой. Во фрейме Битрикса запись в буфер
 * обмена заблокирована (clipboard API и execCommand молча не срабатывают),
 * поэтому кнопки «Скопировать» нет: клик по полю выделяет весь URL —
 * пользователь копирует сам (Ctrl+C); рядом кнопка ↗ открывает ссылку
 * в новой вкладке.
 */
export const ShareLinkUrlField = ({ url }: { url: string }) => (
    <div className="flex items-center gap-1.5">
        <Input
            readOnly
            value={url}
            aria-label="Публичная ссылка на отчёт"
            className="h-8 flex-1 cursor-text text-xs"
            onFocus={e => e.currentTarget.select()}
            onClick={e => e.currentTarget.select()}
        />
        <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 w-8 shrink-0 p-0"
            title="Открыть в новой вкладке"
        >
            <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
            </a>
        </Button>
    </div>
);
