'use client';

import { useCallback, useEffect, useState } from 'react';
import { SIM_HINTS } from '../constants/sim-hints';
import type { SimHint, SimHintContext } from '../constants/sim-hints';

const SEEN_KEY = 'april-sim-hints-seen';
const OFF_KEY = 'april-sim-hints-off';

const readSeen = (): string[] => {
    try {
        const raw = localStorage.getItem(SEEN_KEY);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed)
            ? parsed.filter((item): item is string => typeof item === 'string')
            : [];
    } catch {
        return [];
    }
};

/**
 * Какая подсказка активна прямо сейчас.
 *
 * Показывается первая подходящая из ещё не показанных — по порядку словаря.
 * Закрытая подсказка не возвращается: это сопровождение первого прохода, а не
 * постоянная надпись.
 *
 * Состояние читается только в эффекте — на сервере localStorage нет, и
 * несовпадение с первым рендером дало бы ошибку гидратации. Приём тот же, что
 * в `packages/april-ui/src/lib/glass/use-glass.ts`.
 */
export const useSimHints = (ctx: SimHintContext | null) => {
    const [seen, setSeen] = useState<string[]>([]);
    const [isOff, setOff] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setSeen(readSeen());
        try {
            setOff(localStorage.getItem(OFF_KEY) === '1');
        } catch {
            // приватный режим — подсказки просто останутся включёнными
        }
        setMounted(true);
    }, []);

    const dismiss = useCallback((id: string) => {
        setSeen(current => {
            const next = current.includes(id) ? current : [...current, id];
            try {
                localStorage.setItem(SEEN_KEY, JSON.stringify(next));
            } catch {
                // приватный режим — подсказка не вернётся до перезагрузки
            }
            return next;
        });
    }, []);

    const toggle = useCallback(() => {
        setOff(current => {
            const next = !current;
            try {
                localStorage.setItem(OFF_KEY, next ? '1' : '0');
            } catch {
                // приватный режим — выбор живёт до перезагрузки
            }
            return next;
        });
    }, []);

    /** Показать всё заново — в том числе уже закрытые. */
    const restart = useCallback(() => {
        setSeen([]);
        try {
            localStorage.removeItem(SEEN_KEY);
            localStorage.setItem(OFF_KEY, '0');
        } catch {
            // приватный режим
        }
        setOff(false);
    }, []);

    const active: SimHint | null =
        !mounted || isOff || ctx === null
            ? null
            : (SIM_HINTS.find(
                  hint => !seen.includes(hint.id) && hint.when(ctx),
              ) ?? null);

    return { active, isOff, dismiss, toggle, restart };
};
