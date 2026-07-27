'use client';

import { useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { plansActions } from '../model/plans-slice';
import { savePlans } from '../model/plans-thunks';
import type {
    PlanIndicatorConfig,
    PlansConfig,
    PlanTargetSaveItem,
} from '../model';

/** Черновик целей: `${userId}:${code}` → строка инпута. */
type TargetDraft = Record<string, string>;

const draftKey = (userId: number, code: string): string =>
    `${userId}:${code}`;

export interface UsePlansSettingsResult {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    draftIndicators: PlanIndicatorConfig[];
    /**
     * Видимые в диалоге показатели: по умолчанию только настроенные
     * (включённые на момент открытия + включённые в черновике); шестерёнка
     * раскрывает весь каталог. Ничего не настроено — сразу весь каталог.
     */
    visibleIndicators: PlanIndicatorConfig[];
    showAllIndicators: boolean;
    /** Есть и настроенные, и скрытые фильтром — шестерёнке есть что раскрывать. */
    canToggleIndicators: boolean;
    toggleShowAllIndicators: () => void;
    patchIndicator: (
        code: string,
        patch: Partial<Omit<PlanIndicatorConfig, 'code'>>,
    ) => void;
    /** Сотрудники структуры (Bitrix id + имя) для таблицы целей. */
    employees: { userId: number; name: string }[];
    targetValue: (userId: number, code: string) => string;
    setTargetValue: (userId: number, code: string, value: string) => void;
    save: () => void;
    saveStatus: string;
    saveError: string | null;
    /** Вернуться из статус-панели (ошибка) к форме. */
    resetStatus: () => void;
}

/**
 * Черновик диалога настроек планов: конфиг показателей + цели
 * сотрудников; при открытии заполняется из стора, «Сохранить» шлёт
 * конфиг целиком и ТОЛЬКО изменённые цели (diff).
 */
export const usePlansSettings = (): UsePlansSettingsResult => {
    const dispatch = useAppDispatch();
    const catalogIndicators = useAppSelector(
        state => state.plans.indicators,
    );
    const targetsByUser = useAppSelector(state => state.plans.targetsByUser);
    const departmentItems = useAppSelector(state => state.department.items);
    const saveStatus = useAppSelector(state => state.plans.saveStatus);
    const saveError = useAppSelector(state => state.plans.saveError);

    const [isOpen, setOpenState] = useState(false);
    const [draftIndicators, setDraftIndicators] = useState<
        PlanIndicatorConfig[]
    >([]);
    const [targetDraft, setTargetDraft] = useState<TargetDraft>({});
    const [showAllIndicators, setShowAllIndicators] = useState(false);
    // Снимок включённых на момент открытия: выключенный в черновике
    // показатель не исчезает из списка до закрытия диалога.
    const [openEnabledCodes, setOpenEnabledCodes] = useState<
        ReadonlySet<string>
    >(new Set());

    const employees = useMemo(
        () =>
            (departmentItems ?? [])
                .filter(item => Number(item?.ID) > 0)
                .map(item => ({
                    userId: Number(item.ID),
                    name:
                        [item.NAME, item.LAST_NAME]
                            .filter(Boolean)
                            .join(' ') || `Сотрудник #${item.ID}`,
                })),
        [departmentItems],
    );

    // Открытие — черновик из стора (конфиг + текущие цели).
    const setOpen = useCallback(
        (open: boolean) => {
            setOpenState(open);
            if (open) {
                setDraftIndicators(
                    catalogIndicators.map(indicator => ({ ...indicator })),
                );
                const draft: TargetDraft = {};
                Object.entries(targetsByUser).forEach(([userId, byCode]) => {
                    Object.entries(byCode).forEach(([code, value]) => {
                        if (value !== null) {
                            draft[draftKey(Number(userId), code)] =
                                String(value);
                        }
                    });
                });
                setTargetDraft(draft);
                setShowAllIndicators(false);
                setOpenEnabledCodes(
                    new Set(
                        catalogIndicators
                            .filter(indicator => indicator.enabled)
                            .map(indicator => indicator.code),
                    ),
                );
                dispatch(plansActions.resetSaveStatus());
            }
        },
        [catalogIndicators, targetsByUser, dispatch],
    );

    const visibleIndicators = useMemo(() => {
        if (showAllIndicators || openEnabledCodes.size === 0) {
            return draftIndicators;
        }
        return draftIndicators.filter(
            indicator =>
                openEnabledCodes.has(indicator.code) || indicator.enabled,
        );
    }, [draftIndicators, showAllIndicators, openEnabledCodes]);

    const canToggleIndicators =
        openEnabledCodes.size > 0 &&
        openEnabledCodes.size < draftIndicators.length;

    const toggleShowAllIndicators = useCallback(() => {
        setShowAllIndicators(prev => !prev);
    }, []);

    const patchIndicator = useCallback(
        (
            code: string,
            patch: Partial<Omit<PlanIndicatorConfig, 'code'>>,
        ) => {
            setDraftIndicators(prev =>
                prev.map(indicator =>
                    indicator.code === code
                        ? { ...indicator, ...patch }
                        : indicator,
                ),
            );
        },
        [],
    );

    const targetValue = useCallback(
        (userId: number, code: string) =>
            targetDraft[draftKey(userId, code)] ?? '',
        [targetDraft],
    );

    const setTargetValue = useCallback(
        (userId: number, code: string, value: string) => {
            setTargetDraft(prev => ({
                ...prev,
                [draftKey(userId, code)]: value,
            }));
        },
        [],
    );

    const save = useCallback(() => {
        const config: PlansConfig = {
            version: 1,
            indicators: draftIndicators,
        };
        // Diff целей против стора: шлём только изменённые.
        const changes: PlanTargetSaveItem[] = [];
        employees.forEach(employee => {
            draftIndicators.forEach(indicator => {
                const raw = targetDraft[
                    draftKey(employee.userId, indicator.code)
                ]?.trim();
                const draftValue =
                    raw === undefined || raw === '' ? null : Number(raw);
                if (draftValue !== null && !Number.isFinite(draftValue)) {
                    return; // мусор в инпуте — не отправляем
                }
                const storedValue =
                    targetsByUser[employee.userId]?.[indicator.code] ?? null;
                if (draftValue !== storedValue) {
                    changes.push({
                        userId: employee.userId,
                        code: indicator.code,
                        value: draftValue,
                    });
                }
            });
        });
        // Диалог не закрываем: статус-панель покажет прогресс/успех/ошибку
        // (при первом сохранении Bitrix ставит поля — это долго).
        void dispatch(savePlans(config, changes));
    }, [dispatch, draftIndicators, employees, targetDraft, targetsByUser]);

    const resetStatus = useCallback(() => {
        dispatch(plansActions.resetSaveStatus());
    }, [dispatch]);

    return {
        isOpen,
        setOpen,
        draftIndicators,
        visibleIndicators,
        showAllIndicators,
        canToggleIndicators,
        toggleShowAllIndicators,
        patchIndicator,
        employees,
        targetValue,
        setTargetValue,
        save,
        saveStatus,
        saveError,
        resetStatus,
    };
};
