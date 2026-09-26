'use client';

import { TriangleAlert } from 'lucide-react';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@workspace/ui/components/alert';
import {
    AI_SETTINGS_BLOCK_LABELS,
    type AiSettingsBlockName,
} from '@/modules/entities/ai-analytics';

interface AiSettingsConfirmProps {
    /** Блоки payload, правка которых двигает comparableFrom. */
    blocks: AiSettingsBlockName[];
}

/** Шаг подтверждения: изменения сдвинут начало сравнимой истории вперёд. */
export const AiSettingsConfirm = ({ blocks }: AiSettingsConfirmProps) => (
    <Alert>
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>
            Это сдвинет начало сравнимой истории вперёд: продолжить?
        </AlertTitle>
        <AlertDescription className="space-y-1 text-xs">
            <p>
                Изменения в блоках{' '}
                {blocks
                    .map(block => `«${AI_SETTINGS_BLOCK_LABELS[block]}»`)
                    .join(', ')}{' '}
                меняют правила расчёта. Сервер сдвинет comparableFrom на
                сегодня: тренды до этой даты станут несопоставимы с новыми, а в
                журнале событий появится автозапись о разрыве ряда.
            </p>
            <p>Остальные блоки сохранятся как обычно.</p>
        </AlertDescription>
    </Alert>
);
