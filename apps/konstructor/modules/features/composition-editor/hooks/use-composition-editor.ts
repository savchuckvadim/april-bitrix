'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import type { RootState } from '@/modules/app';
import {
    academyFits,
    academyPackagesFor,
    getComplectRuleFlags,
    selectCatalog,
} from '@/modules/entities/catalog';
import {
    applyAction,
    checkComplectWeight,
    describeLtPackets,
    isBlocking,
    validateComposition,
    type CompositionAction,
    type CompositionCtx,
    type RuleViolation,
} from '@/modules/entities/composition';
import { rowSetActions, setTermMonths, type KRow } from '@/modules/entities/row-set';
import { toggleSectionItem, type SectionKind } from '../lib/composition-sections.util';
import { useCompositionSections } from './use-composition-sections';
import { useCompositionView } from './use-composition-view';

/**
 * Редактор наполнения ПЕРЕДАННОЙ строки — любой garant-строки любого сета
 * (снятие легаси-ограничения «наполнение только у главного товара»): на шаге
 * «Комплект» — главная строка, на «Ценах» — строка из своей карточки.
 * Чекбоксы гоняются через rules-engine (applyAction); в free-режиме правила
 * не принуждают, только подсвечивают.
 */
export const useCompositionEditor = (row: KRow | null) => {
    const dispatch = useAppDispatch();
    const catalog = useAppSelector(selectCatalog);
    // текущий регион сборки — тумблер «Региональное законодательство» тянет его в состав
    const regionCode = useAppSelector(state => state.rowSet.context.regionCode);
    // сервисному отделу открыт средний пакет LT-other (вес 4)
    const serviceDepartment = useAppSelector(state =>
        Boolean(state.rowSet.context.serviceDepartment),
    );
    // набор строки: срок сделки для академии и право на доп. пакеты LT
    const set = useAppSelector((state: RootState) =>
        !row
            ? null
            : state.rowSet.general.id === row.setId
              ? state.rowSet.general
              : (state.rowSet.alternative.find(item => item.id === row.setId) ?? null),
    );
    // автоправки последнего действия — до следующего действия или смены строки/комплекта
    const [autoFixes, setAutoFixes] = useState<string[]>([]);
    const view = useCompositionView();
    const sections = useCompositionSections(
        catalog,
        row?.composition ?? null,
        view.showWeights,
        view.mode === 'classic',
    );

    const composition = row?.composition ?? null;
    const complect = composition
        ? (catalog.complects.byCode[composition.complectCode] ?? null)
        : null;
    const rowKey = row?.key ?? null;
    const complectCode = composition?.complectCode ?? null;
    useEffect(() => {
        setAutoFixes([]);
    }, [rowKey, complectCode]);

    const termMonths = set ? setTermMonths(set, catalog) : null;
    const ctx: CompositionCtx | null = useMemo(
        () => (complect ? { complect, catalog, regionCode, serviceDepartment, termMonths } : null),
        [complect, catalog, regionCode, serviceDepartment, termMonths],
    );

    // нарушения — всегда по текущему составу: смена комплекта, восстановленный
    // слепок и правка из карточки строки подсвечиваются без «залипшего» сообщения
    const violations: RuleViolation[] = useMemo(
        () => (composition && ctx ? validateComposition(composition, ctx) : []),
        [composition, ctx],
    );

    const ltPackets = useMemo(
        () => (composition && ctx ? describeLtPackets(composition, ctx) : []),
        [composition, ctx],
    );
    // доп. пакеты LT — только в основном наборе (легаси: у альтернатив их нет)
    const canHaveExtraLt = set?.kind === 'general';

    const currentAcademy = composition?.academy
        ? (catalog.academy.find(pkg => pkg.code === composition.academy) ?? null)
        : null;
    const academy = {
        termMonths,
        /** Пакеты под срок сделки; текущий остаётся в списке, даже если уже не подходит */
        options: [
            ...academyPackagesFor(catalog, termMonths),
            ...(currentAcademy && termMonths !== null && !academyFits(currentAcademy, termMonths)
                ? [currentAcademy]
                : []),
        ],
        current: currentAcademy,
        currentFits:
            !currentAcademy || termMonths === null || academyFits(currentAcademy, termMonths),
    };

    const writeComposition = (next: NonNullable<KRow['composition']>) => {
        if (!row) return;
        dispatch(
            rowSetActions.setRowComposition({
                setId: row.setId,
                key: row.key,
                composition: next,
            }),
        );
    };

    const applyComposition = (action: CompositionAction) => {
        if (!composition || !ctx) return;
        const result = applyAction(composition, action, ctx);
        // блокирующее нарушение действия — состав не изменился, но причину показать надо
        setAutoFixes(result.autoFixes);
        setBlocked(result.violations.filter(isBlocking));
        writeComposition(result.composition);
    };

    const [blocked, setBlocked] = useState<RuleViolation[]>([]);
    useEffect(() => {
        setBlocked([]);
    }, [rowKey, complectCode]);

    const toggleMode = () => {
        if (!composition) return;
        writeComposition({
            ...composition,
            mode: composition.mode === 'rules' ? 'free' : 'rules',
        });
    };

    const weightCheck =
        composition && complect
            ? checkComplectWeight(composition, { complect, catalog, regionCode })
            : null;

    return {
        row,
        composition,
        catalog,
        sections,
        view,
        ltPackets,
        canHaveExtraLt,
        academy,
        /** СТАР встроен в комплект и не переключается */
        starLocked: Boolean(complect && getComplectRuleFlags(complect).withStar),
        freeMode: composition?.mode === 'free',
        applyComposition,
        toggleItem: (kind: SectionKind, code: string, next: boolean) =>
            applyComposition(toggleSectionItem(kind, code, next)),
        toggleMode,
        /** Что сказать менеджеру: живые нарушения + отказ последнего действия + автоправки */
        messages: { violations, blocked, autoFixes },
        weightCheck,
    };
};

export type CompositionEditorState = ReturnType<typeof useCompositionEditor>;
