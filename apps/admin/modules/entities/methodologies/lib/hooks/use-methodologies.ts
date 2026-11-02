'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { METHODOLOGY_OPTIONS_KEY } from '@/modules/entities/portal/ai-settings/lib/hooks/use-methodology-options';
import {
    MethodologiesHelper,
    type MethodologyAssistInput,
} from '../api/methodologies-helper';
import {
    METHODOLOGIES_TEXT,
    type MethodologyConfig,
    type MethodologySave,
} from '../../model';

const helper = new MethodologiesHelper();
export const METHODOLOGIES_KEY = 'methodologies';
export const METHODOLOGY_DETAIL_KEY = 'methodology-detail';
export const METHODOLOGY_CATALOG_KEY = 'methodology-catalog';

/** Строки методик: общий слой и, с доменом, свои методики портала. */
export const useMethodologies = (domain: string | undefined) =>
    useQuery({
        queryKey: [METHODOLOGIES_KEY, domain ?? null],
        queryFn: () => helper.items(domain),
        staleTime: 30_000,
    });

/** Карточка методики: строка по id либо встроенная по коду. */
export const useMethodologyDetail = (
    id: string | null,
    code: string | null,
    enabled = true,
) =>
    useQuery({
        queryKey: [METHODOLOGY_DETAIL_KEY, id, code],
        queryFn: () => helper.detail(id, code),
        enabled: enabled && (id !== null || code !== null),
        staleTime: 10_000,
    });

/** Каталог формы: справочники с подписями, пункты-кандидаты, ограничители ядра. */
export const useMethodologyCatalog = () =>
    useQuery({
        queryKey: [METHODOLOGY_CATALOG_KEY],
        queryFn: () => helper.catalog(),
        staleTime: 5 * 60_000,
    });

/** Проверка конфига без сохранения. */
export const useValidateMethodology = () =>
    useMutation({
        mutationFn: (config: MethodologyConfig) => helper.validate(config),
        onError: error =>
            toast.error(METHODOLOGIES_TEXT.editor.validateError, {
                description: getApiErrorMessage(error),
            }),
    });

/** Сохранение строки; после — списки, карточки и бейджи выбора устаревают. */
export const useSaveMethodology = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: MethodologySave) => helper.save(body),
        onSuccess: () => {
            toast.success(METHODOLOGIES_TEXT.editor.saved);
            void qc.invalidateQueries({ queryKey: [METHODOLOGIES_KEY] });
            void qc.invalidateQueries({ queryKey: [METHODOLOGY_DETAIL_KEY] });
            void qc.invalidateQueries({ queryKey: [METHODOLOGY_OPTIONS_KEY] });
        },
        onError: error =>
            toast.error(METHODOLOGIES_TEXT.editor.saveError, {
                description: getApiErrorMessage(error),
            }),
    });
};

/** Помощник: документ → черновик конфига. */
export const useMethodologyAssist = () =>
    useMutation({
        mutationFn: (input: MethodologyAssistInput) => helper.assist(input),
        onError: error =>
            toast.error(METHODOLOGIES_TEXT.assistant.failed, {
                description: getApiErrorMessage(error),
            }),
    });
