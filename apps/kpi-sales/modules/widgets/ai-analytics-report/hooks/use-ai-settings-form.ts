'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MicroSelectOption } from '@workspace/april-ui';
import { useAccess, useAppDispatch, useAppSelector } from '@/modules/app';
import { EAccessFeature } from '@/modules/shared/access';
import {
    aiToday,
    saveAiLevels,
    type AiManagerLevel,
    type AiSettingsInput,
    type AiTargetField,
} from '@/modules/entities/ai-analytics';
import { useAiManagerName } from './use-ai-manager-name';
import {
    addAiAbsenceRow,
    buildAiSettingsForm,
    patchAiAbsenceRow,
    patchAiLevelRow,
    patchAiTargetRow,
    removeAiAbsenceRow,
    setAiRoster,
    type AiAbsenceFormRow,
    type AiSettingsFormState,
    type AiSettingsPrefill,
    type AiSettingsTab,
} from '../lib/ai-settings-form.util';
import {
    aiSettingsErrorTabs,
    validateAiSettingsForm,
} from '../lib/ai-settings-form.validate';
import {
    aiSettingsBreakingBlocks,
    aiSettingsPayloadBlocks,
    applyAiSettingsPayload,
    buildAiSettingsSummary,
    toAiSettingsPayload,
    type AiSettingsSaveSummary,
} from '../lib/ai-settings-form.payload';

/** Шаг диалога: правка → подтверждение сдвига истории (если нужно) → сводка. */
export type AiSettingsStep = 'edit' | 'confirm' | 'done';

/**
 * Форма настроек витрины: уровни из обзора; цели, личные цели, отсутствия
 * и дата подтверждения состава — из settings/get (предзаполнение при
 * открытии и когда настройки приходят позже). В payload уходят только
 * изменённые блоки; если среди них есть рвущие сравнимую историю — сначала
 * подтверждение; после ответа бэка — сводка (comparableFrom, коды,
 * предупреждения). Окно не закрывается само. Только AI_CONFIGURE (cup|op):
 * остальным поля read-only.
 */
export const useAiSettingsForm = (
    open: boolean,
    initialTab: AiSettingsTab = 'levels',
) => {
    const dispatch = useAppDispatch();
    const managers = useAppSelector(
        state => state.aiAnalytics.overview.data?.managers,
    );
    const settings = useAppSelector(state => state.aiAnalytics.settings.data);
    const saving = useAppSelector(state => state.aiAnalytics.levels.saving);
    const error = useAppSelector(state => state.aiAnalytics.levels.error);
    const readOnly = !useAccess(EAccessFeature.AI_CONFIGURE);
    const managerName = useAiManagerName();

    const [form, setForm] = useState<AiSettingsFormState>(() =>
        buildAiSettingsForm([]),
    );
    const [tab, setTab] = useState<AiSettingsTab>(initialTab);
    const [step, setStep] = useState<AiSettingsStep>('edit');
    const [summary, setSummary] = useState<AiSettingsSaveSummary | null>(null);

    // settings/get кэшируется на сервере 300 с: блоки, сохранённые в этой
    // сессии, перекрывают настройки стора, пока те не перечитаны.
    const savedRef = useRef<AiSettingsInput>({});
    useEffect(() => {
        savedRef.current = {};
    }, [settings]);

    const prefillRef = useRef<{
        managers: typeof managers;
        settings: AiSettingsPrefill | null;
    }>({ managers, settings });

    // Источники могли прийти при открытом окне — подставляем, пока форму
    // не трогали. Перечитка обзора после сохранения (listener levelsSaved)
    // заполненную форму и сводку не сбрасывает.
    useEffect(() => {
        const prefill = settings
            ? applyAiSettingsPayload(settings, savedRef.current)
            : null;
        prefillRef.current = { managers, settings: prefill };
        if (!open) return;
        setForm(prev =>
            prev.dirty.length > 0
                ? prev
                : buildAiSettingsForm(managers ?? [], prefill),
        );
    }, [open, managers, settings]);

    // Каждое открытие — свежая форма с первого шага.
    useEffect(() => {
        if (!open) return;
        const sources = prefillRef.current;
        setForm(buildAiSettingsForm(sources.managers ?? [], sources.settings));
        setTab(initialTab);
        setStep('edit');
        setSummary(null);
    }, [open, initialTab]);

    const errors = useMemo(() => validateAiSettingsForm(form), [form]);
    const errorTabs = useMemo(() => aiSettingsErrorTabs(errors), [errors]);
    const payload = useMemo(() => toAiSettingsPayload(form), [form]);
    const payloadBlocks = useMemo(
        () => aiSettingsPayloadBlocks(payload),
        [payload],
    );
    const breakingBlocks = useMemo(
        () => aiSettingsBreakingBlocks(payload),
        [payload],
    );
    const managerOptions = useMemo<MicroSelectOption[]>(
        () =>
            form.levels.map(row => ({
                value: String(row.managerId),
                label: managerName(String(row.managerId)),
            })),
        [form.levels, managerName],
    );
    const canSave =
        !readOnly &&
        !saving &&
        errorTabs.length === 0 &&
        payloadBlocks.length > 0;

    const save = useCallback(async (): Promise<void> => {
        const result = await dispatch(saveAiLevels(payload));
        if (result) {
            savedRef.current = { ...savedRef.current, ...payload };
            setSummary(buildAiSettingsSummary(payload, result));
            setStep('done');
        } else {
            setStep('edit');
        }
    }, [dispatch, payload]);

    /** «Сохранить»: блоки, рвущие ряд, сначала требуют подтверждения. */
    const submit = useCallback(async (): Promise<void> => {
        if (!canSave) return;
        if (breakingBlocks.length > 0 && step !== 'confirm') {
            setStep('confirm');
            return;
        }
        await save();
    }, [breakingBlocks.length, canSave, save, step]);

    return {
        form,
        tab,
        setTab,
        step,
        summary,
        errors,
        errorTabs,
        payloadBlocks,
        breakingBlocks,
        saving,
        error,
        readOnly,
        disabled: readOnly || saving,
        isEmpty: form.levels.length === 0,
        canSave,
        managerOptions,
        /** settings/get загружены — статус состава и цели известны. */
        settingsLoaded: settings !== null,
        today: aiToday(),
        setLevel: (managerId: number, level: AiManagerLevel) =>
            setForm(prev => patchAiLevelRow(prev, managerId, { level })),
        setSince: (managerId: number, since: string) =>
            setForm(prev => patchAiLevelRow(prev, managerId, { since })),
        setTarget: (
            level: AiManagerLevel,
            field: AiTargetField,
            value: string,
        ) => setForm(prev => patchAiTargetRow(prev, level, field, value)),
        addAbsence: () => setForm(prev => addAiAbsenceRow(prev)),
        patchAbsence: (
            id: number,
            changes: Partial<Omit<AiAbsenceFormRow, 'id'>>,
        ) => setForm(prev => patchAiAbsenceRow(prev, id, changes)),
        removeAbsence: (id: number) =>
            setForm(prev => removeAiAbsenceRow(prev, id)),
        confirmRoster: () => setForm(prev => setAiRoster(prev, aiToday())),
        clearRoster: () => setForm(prev => setAiRoster(prev, '')),
        resetRoster: () => setForm(prev => setAiRoster(prev, null)),
        submit,
        backToEdit: () => setStep('edit'),
    };
};

export type AiSettingsForm = ReturnType<typeof useAiSettingsForm>;
