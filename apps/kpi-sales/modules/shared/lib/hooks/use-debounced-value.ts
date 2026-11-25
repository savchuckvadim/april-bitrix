'use client';

import { useEffect, useState } from 'react';

const NEVER = (): boolean => false;

/**
 * Значение с паузой: новое значение доходит до потребителя через `delayMs`
 * после последней правки (серия правок — одно обновление). `isImmediate`
 * решает, какие правки пропускать без паузы: получает прошлое доставленное и
 * новое значение. Если значение вернулось к доставленному до конца паузы —
 * потребитель ничего не заметит. Первое значение доставляется сразу.
 */
export function useDebouncedValue<Value>(
    value: Value,
    delayMs: number,
    isImmediate: (previous: Value, next: Value) => boolean = NEVER,
): Value {
    const [settled, setSettled] = useState(value);
    const changed = !Object.is(settled, value);
    const immediate = changed && isImmediate(settled, value);

    useEffect(() => {
        if (!changed) return;
        if (immediate) {
            setSettled(value);
            return;
        }
        const timer = setTimeout(() => setSettled(value), delayMs);
        return () => clearTimeout(timer);
    }, [changed, immediate, value, delayMs]);

    return immediate ? value : settled;
}
