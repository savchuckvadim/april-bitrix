'use client';

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { SALES_PRESETS } from '../constants/presets';
import { SALES_QUESTIONS } from '../constants/questions';
import {
    getProcessConfig,
    hydrateProcessConfig,
    resetProcessConfig,
    saveProcessConfig,
    subscribeProcessConfig,
} from '../lib/config-storage';
import { deriveProcessModel } from '../lib/coverage';
import {
    ProcessConfig,
    ProcessDefinition,
    ProcessModel,
    ProcessPreset,
} from '../types';

export interface UseProcessConfigResult {
    config: ProcessConfig;
    /** Разобранная конфигурация — всё, что нужно рендереру. */
    model: ProcessModel;
    /** Пресет, которому в точности соответствуют крутилки, если такой есть. */
    activePreset: ProcessPreset | null;
    setLeadPct: (value: number) => void;
    setDealPct: (value: number) => void;
    setAnswer: (questionId: string, choice: string) => void;
    setLists: (lists: Record<string, string[]>) => void;
    applyPreset: (preset: ProcessPreset) => void;
    /** Ставит рекомендованный пресет и рекомендованный ответ в каждом вопросе. */
    applyRecommended: () => void;
    reset: () => void;
}

/**
 * Единственная точка доступа к конфигурации процесса.
 *
 * Состояние живёт вне React (localStorage + window-событие), поэтому все виды
 * процесса и все компоненты пульта видят одно и то же, а переключение вида
 * настройку не теряет.
 */
export const useProcessConfig = (
    definition: ProcessDefinition,
): UseProcessConfigResult => {
    const processId = definition.id;

    const config = useSyncExternalStore(
        subscribeProcessConfig,
        () => getProcessConfig(processId),
        () => getProcessConfig(processId),
    );

    // Гидратация только на клиенте: на сервере localStorage нет, а разметка
    // первого рендера обязана совпасть с серверной.
    useEffect(() => {
        hydrateProcessConfig(processId);
    }, [processId]);

    const model = useMemo(
        () => deriveProcessModel(definition, config),
        [definition, config],
    );

    const activePreset = useMemo(
        () =>
            SALES_PRESETS.find(
                preset =>
                    preset.leadPct === config.leadPct &&
                    preset.dealPct === config.dealPct,
            ) ?? null,
        [config.leadPct, config.dealPct],
    );

    const patch = useCallback(
        (next: Partial<ProcessConfig>) => {
            saveProcessConfig(processId, {
                ...getProcessConfig(processId),
                ...next,
            });
        },
        [processId],
    );

    const setLeadPct = useCallback(
        (value: number) => patch({ leadPct: value }),
        [patch],
    );

    const setDealPct = useCallback(
        (value: number) => patch({ dealPct: value }),
        [patch],
    );

    const setAnswer = useCallback(
        (questionId: string, choice: string) => {
            const current = getProcessConfig(processId);
            const answers = { ...current.answers };

            // Повторный клик по выбранному варианту снимает выбор — так же,
            // как в анкете how-we-work.
            if (answers[questionId] === choice) {
                delete answers[questionId];
            } else {
                answers[questionId] = choice;
            }

            patch({ answers });
        },
        [patch, processId],
    );

    /** Правки списков стадий и статусов — рядом с ответами на вопросы. */
    const setLists = useCallback(
        (lists: Record<string, string[]>) => patch({ lists }),
        [patch],
    );

    const applyPreset = useCallback(
        (preset: ProcessPreset) =>
            patch({ leadPct: preset.leadPct, dealPct: preset.dealPct }),
        [patch],
    );

    /**
     * Собрать рекомендованную конфигурацию целиком: пресет крутилок плюс
     * рекомендованный вариант в каждом активном вопросе.
     *
     * Это не «случайные ответы»: у каждого показателя берётся ровно тот вариант,
     * который мы советуем и обосновываем в тексте. Кнопка нужна, чтобы заказчик
     * увидел целевую схему одним движением, а потом спорил с ней по пунктам.
     */
    const applyRecommended = useCallback(() => {
        const preset =
            SALES_PRESETS.find(item => item.recommended) ?? SALES_PRESETS[0];

        const answers = Object.fromEntries(
            SALES_QUESTIONS.filter(question => question.isActive)
                .map(question => [
                    question.id,
                    question.options.find(option => option.recommended)?.code,
                ])
                .filter((pair): pair is [string, string] => Boolean(pair[1])),
        );

        saveProcessConfig(processId, {
            leadPct: preset?.leadPct ?? 0,
            dealPct: preset?.dealPct ?? 100,
            answers,
        });
    }, [processId]);

    const reset = useCallback(() => resetProcessConfig(processId), [processId]);

    return {
        config,
        model,
        activePreset,
        setLeadPct,
        setDealPct,
        setAnswer,
        setLists,
        applyPreset,
        applyRecommended,
        reset,
    };
};
