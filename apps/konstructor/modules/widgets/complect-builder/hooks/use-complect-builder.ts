'use client';

import { toast } from 'sonner';
import type { ChoiceChipOption } from '@workspace/april-ui/fields';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    getComplectIcon,
    getComplectTone,
    selectCatalog,
} from '@/modules/entities/catalog';
import {
    explainRefsRebuildFailure,
    rebuildRowWithRefs,
    rowSetActions,
    selectMainRow,
    selectRowSetContext,
} from '@/modules/entities/row-set';
import {
    ROUTE_KONSTRUCTOR,
    useKonstructorNavigation,
} from '@/modules/shared/lib/routing';

/**
 * Шаг «Комплект»: комплекты линейки главной строки чипами (узко, внимание —
 * на наполнении) и наполнение главной строки. Смена комплекта — пересборка
 * строки с наполнением нового комплекта по умолчанию (rebuildRowWithRefs).
 */
export const useComplectBuilder = () => {
    const dispatch = useAppDispatch();
    const nav = useKonstructorNavigation();
    const catalog = useAppSelector(selectCatalog);
    const context = useAppSelector(selectRowSetContext);
    const mainRow = useAppSelector(selectMainRow);

    const current = mainRow?.refs.complectCode
        ? (catalog.complects.byCode[mainRow.refs.complectCode] ?? null)
        : null;

    const complectOptions: ChoiceChipOption[] = (
        current ? catalog.complects[current.type] : []
    ).map(complect => ({
        value: complect.code,
        label: complect.title,
        icon: getComplectIcon(complect.code),
        tone: getComplectTone(complect.code),
    }));

    const selectComplect = (complectCode: string) => {
        if (!mainRow) return;
        const row = rebuildRowWithRefs(catalog, context, mainRow, {
            complectCode,
        });
        if (!row) {
            toast.error(explainRefsRebuildFailure(catalog, context, mainRow, { complectCode }));
            return;
        }
        dispatch(rowSetActions.upsertRow(row));
    };

    return {
        mainRow,
        complectOptions,
        currentComplectCode: current?.code ?? null,
        selectComplect,
        toParams: () => nav.to(ROUTE_KONSTRUCTOR.PARAMS),
    };
};
