'use client';

import { FC } from 'react';
import { HintTooltip } from '@workspace/april-ui';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { countDonePresentations } from '../lib/presentation-count';

/**
 * Сколько презентаций уже провели клиенту — цифрой в шапке.
 *
 * Это первый вопрос при звонке давнему клиенту: показывали мы ему продукт или
 * нет. Раньше ответ был только внутри вкладки истории, до которой в разговоре
 * никто не доходит.
 *
 * Ноль не показываем: «Презентаций: 0» — шум, отсутствие и так очевидно по
 * пустой истории. Пока история не загружена, бейджа тоже нет — врать нулём
 * хуже, чем молчать.
 */
export const PresentationCountBadge: FC = () => {
    const records = useAppSelector(s => s.eventHistory.records);
    const count = countDonePresentations(Object.values(records));

    if (!count) return null;

    return (
        <HintTooltip
            title={`Презентаций проведено: ${count}`}
            lines={['Считаем по истории общения — по всем связям клиента.']}
        >
            <span className="shrink-0 cursor-default rounded-full bg-event-pres/20 px-1.5 py-px text-[0.625rem] font-medium text-[color:color-mix(in_oklab,var(--event-pres),var(--foreground)_var(--tone-soft-mix-strong))]">
                през. {count}
            </span>
        </HintTooltip>
    );
};
