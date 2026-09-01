'use client';

import { FC } from 'react';
import { AlertCircle, CloudOff } from 'lucide-react';
import { Spinner } from '@workspace/april-ui';

import { OUTBOX_NOTICE_TONE } from '../lib/outbox-notice';
import { useOutboxNotice } from '../lib/hooks/use-outbox-notice';

/**
 * Тонкая полоска о сохранённых в браузере отчётах — над списком событий,
 * ровно там же и в том же стиле, что баннер стадии отправки
 * (FlowStatusBanner): отдельного крупного блока и модалок здесь быть не
 * должно.
 *
 * Пока второго сервера нет, отчёт может пролежать в браузере до следующего
 * входа менеджера — и он обязан это видеть: что отчёт не пропал, что его
 * везут прямо сейчас, а в редком случае неполного проведения — что нужно
 * открыть карточку и сверить. Текст и тон выбирает чистая функция
 * (resolveOutboxNotice), компонент — только вёрстка и токены тем.
 */
const TONE_CLASS: Record<string, string> = {
    [OUTBOX_NOTICE_TONE.MUTED]:
        'border-border bg-muted/50 text-muted-foreground',
    [OUTBOX_NOTICE_TONE.WARNING]:
        'border-warning/40 bg-warning/10 text-warning',
};

export const OutboxNoticeBanner: FC = () => {
    const notice = useOutboxNotice();

    if (!notice) {
        return null;
    }
    const isWarning = notice.tone === OUTBOX_NOTICE_TONE.WARNING;

    return (
        <div
            className={`mb-3 flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${TONE_CLASS[notice.tone]}`}
        >
            {isWarning ? (
                <AlertCircle className="size-4 shrink-0" />
            ) : notice.busy ? (
                // Дренаж работает прямо сейчас — живой индикатор вместо
                // статичной иконки: «система везёт» видно в любом состоянии.
                <Spinner size="sm" tone="muted" label="Отчёты отправляются" />
            ) : (
                <CloudOff className="size-4 shrink-0" />
            )}
            <span>{notice.text}</span>
        </div>
    );
};
