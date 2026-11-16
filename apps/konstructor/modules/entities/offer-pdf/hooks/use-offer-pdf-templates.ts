'use client';

import { useEffect, useState } from 'react';
import { readOfferPdfError } from '../lib/api/offer-pdf.api';
import { getOfferPdfTemplates } from '../lib/offer-pdf-templates-cache';
import type { OfferPdfTemplateInfo } from '../model/types';

export interface OfferPdfTemplatesState {
    templates: OfferPdfTemplateInfo[];
    loading: boolean;
    error: string | null;
}

/** Один и тот же пустой список: потребители не пересчитываются на каждый рендер */
const NO_TEMPLATES: OfferPdfTemplateInfo[] = [];

/**
 * Встроенные PDF-стили; `enabled: false` — список не нужен, в сеть не ходим.
 * `loading` выводится из состояния, а не ставится эффектом: между «включили»
 * и «пришло» нет кадра с пустым списком без загрузки.
 */
export const useOfferPdfTemplates = (enabled: boolean): OfferPdfTemplatesState => {
    const [templates, setTemplates] = useState<OfferPdfTemplateInfo[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) return;
        let alive = true;
        // повторное включение после неудачи пробует снова
        setError(null);
        getOfferPdfTemplates()
            .then(list => alive && setTemplates(list))
            .catch(async reason => {
                const message = await readOfferPdfError(reason);
                if (alive) setError(message);
            });
        return () => {
            alive = false;
        };
    }, [enabled]);

    return {
        templates: templates ?? NO_TEMPLATES,
        loading: enabled && templates === null && error === null,
        error,
    };
};
