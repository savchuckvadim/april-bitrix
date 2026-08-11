'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';

/** Ступень лестницы стадий лида (из слепка портала). */
export interface LeadStageDictItem {
    /** Плоский STATUS_ID лида (например, PBX_ASSIGNED). */
    statusId: string;
    name: string;
    color?: string;
}

/** Штатные финалы Битрикса — в лестницу пути не входят. */
const FINAL_LEAD_STATUS_IDS = new Set(['CONVERTED', 'JUNK']);

/**
 * Лестница стадий лида портала для градиент-полоски: стадии sales-категории
 * слепка портала в их порядке, без финалов (CONVERTED/JUNK). Лид на финале
 * в лестницу не попадает — вызывающий показывает семантический бейдж.
 */
export const useLeadStageDict = (): LeadStageDictItem[] => {
    const portal = useAppSelector(s => s.portal.portal);
    return useMemo(() => {
        const categories = portal?.lead?.categories ?? [];
        const category =
            categories.find(item => item.group === 'sales') ?? categories[0];
        return (category?.stages ?? [])
            .filter(stage => !FINAL_LEAD_STATUS_IDS.has(stage.bitrixId))
            .map(stage => {
                const color = stage.color?.trim();
                return {
                    statusId: stage.bitrixId,
                    name: stage.title || stage.name,
                    color: color
                        ? color.startsWith('#')
                            ? color
                            : `#${color}`
                        : undefined,
                };
            });
    }, [portal]);
};

/** Позиция стадии в лестнице; -1 — стадия вне пути (финал/чужая/нет слепка). */
export const findLeadStageIndex = (
    dict: LeadStageDictItem[],
    statusId: string | null | undefined,
): number =>
    statusId ? dict.findIndex(item => item.statusId === statusId) : -1;
