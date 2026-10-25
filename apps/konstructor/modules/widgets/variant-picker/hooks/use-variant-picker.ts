'use client';

import { useAppSelector } from '@/modules/app';
import {
    COMPLECT_VARIANT_STAGE_TITLE,
    type ComplectVariantRecordDto,
} from '@/modules/entities/complect-variant';
import { selectSnapshotRestored } from '@/modules/entities/snapshot';
import { useComplectVariants } from '@/modules/features/complect-variant-select';
import {
    ROUTE_KONSTRUCTOR,
    useKonstructorNavigation,
} from '@/modules/shared/lib/routing';
import { VARIANT_STAGE_TONE } from '../lib/variant-stage-tone';

/**
 * Выбор варианта КП на входе в сделку: открыть один из вариантов, продолжить
 * последнюю сборку сделки или начать новый вариант.
 */
export const useVariantPicker = () => {
    const variants = useComplectVariants();
    const hasCurrentBuild = useAppSelector(selectSnapshotRestored);
    const nav = useKonstructorNavigation();

    const items = variants.records.map(record => {
        const stage = variants.stageOf(record.variantSmartId);
        return {
            key: String(record.id),
            record,
            title: variants.titleOf(record),
            stageTitle: COMPLECT_VARIANT_STAGE_TITLE[stage],
            stageTone: VARIANT_STAGE_TONE[stage],
            isOpen: record.variantSmartId === variants.openVariantSmartId,
        };
    });

    const open = async (record: ComplectVariantRecordDto) => {
        if (await variants.open(record)) nav.to(ROUTE_KONSTRUCTOR.DOCUMENT);
    };

    // Новый вариант не должен писаться поверх открытого
    const startNew = async () => {
        if (variants.openVariantSmartId) await variants.close();
        nav.to(ROUTE_KONSTRUCTOR.START);
    };

    return {
        items,
        isBusy: variants.isBusy,
        error: variants.error,
        hasCurrentBuild,
        open,
        startNew,
        continueCurrent: () => nav.to(ROUTE_KONSTRUCTOR.DOCUMENT),
    };
};
