'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    PREFLIGHT_ITEMS,
    getPreflightKindsKey,
    type PreflightItem,
    type PreflightItemKind,
} from '@/modules/processes/event/lib/send-preflight';

export interface SendPreflightView {
    /** Пункты окна: снимок на момент открытия плюс появившиеся позже. */
    items: PreflightItem[];
    /** Виды, которые уже заполнены — пункт остаётся, но помечается сделанным. */
    doneKinds: Set<PreflightItemKind>;
    isReady: boolean;
}

const parseKinds = (key: string): PreflightItemKind[] =>
    key ? (key.split(',') as PreflightItemKind[]) : [];

/**
 * Что показать в окне предпроверки.
 *
 * Список пунктов — СНИМОК: раньше он был живым, и первый же введённый символ
 * делал пункт заполненным, а поле вместе с курсором исчезало прямо во время
 * набора — текст уходил в никуда. Теперь заполненный пункт остаётся на месте
 * с галочкой до закрытия окна, а появившееся новое незаполненное дописывается
 * в конец (сменил статус — увидел, что теперь нужно).
 */
export const useSendPreflight = (): SendPreflightView => {
    const isOpen = useAppSelector(s => s.eventItemMenu.isPreflightOpen);
    const kindsKey = useAppSelector(s =>
        s.eventItemMenu.isPreflightOpen ? getPreflightKindsKey(s) : '',
    );

    const [items, setItems] = useState<PreflightItem[]>([]);

    useEffect(() => {
        if (!isOpen) {
            setItems([]);
            return;
        }
        setItems(prev => {
            const known = new Set(prev.map(item => item.kind));
            const added = parseKinds(kindsKey)
                .filter(kind => !known.has(kind))
                .map(kind => PREFLIGHT_ITEMS[kind]);
            return added.length ? [...prev, ...added] : prev;
        });
    }, [isOpen, kindsKey]);

    const pending = new Set(parseKinds(kindsKey));

    return {
        items,
        doneKinds: new Set(
            items.map(item => item.kind).filter(kind => !pending.has(kind)),
        ),
        isReady: kindsKey === '',
    };
};
