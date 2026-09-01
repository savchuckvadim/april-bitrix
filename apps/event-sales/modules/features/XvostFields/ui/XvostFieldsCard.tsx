'use client';

import { FC } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { useXvostFields } from '../lib/hooks/use-xvost-fields';
import { XvostDateRow } from './XvostDateRow';

/**
 * «Хвост» — ручная правка хвост-полей СДЕЛКИ (даты решения и булевы вопросы
 * «Разговора»). Штатно их заполняет опросник после презентации; карточка —
 * для исключений, о чём говорит подпись секции.
 *
 * Самогейтится по слепку: нет сделки в контексте или ни одного
 * установленного поля — карточки нет.
 */
export const XvostFieldsCard: FC = () => {
    const xvost = useXvostFields();

    if (!xvost.isAvailable) return null;

    return (
        <SectionCard
            title="Хвост"
            description="Обычно заполняется опросником после презентации; вручную — только исключения. Пишется в сделку."
            density="compact"
            collapsible
            defaultOpen
        >
            <div className="space-y-2">
                {xvost.dates.map(date => (
                    <XvostDateRow key={date.code} date={date} />
                ))}


                {xvost.error && (
                    <p className="text-xs text-destructive">{xvost.error}</p>
                )}
            </div>
        </SectionCard>
    );
};
