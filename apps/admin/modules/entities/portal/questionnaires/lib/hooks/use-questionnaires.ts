'use client';

import {
    useMutation,
    useQueries,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { QuestionnairesHelper } from '../api/questionnaires-helper';
import { getQuestionnaireErrorMessage } from '../questionnaire-error';
import type {
    PortalQuestionnaire,
    PortalQuestionnaireSave,
    QuestionnaireAppCode,
} from '../../model';

const helper = new QuestionnairesHelper();

/** Корень ключей раздела: список и карточка живут в разных ветках. */
export const QUESTIONNAIRES_KEY = ['portal-questionnaires'] as const;

/** Ключ списка анкет портала (в срезе приложения). */
export const questionnairesListKey = (
    portalId?: number,
    appCode?: QuestionnaireAppCode,
) => [...QUESTIONNAIRES_KEY, 'list', portalId, appCode ?? null] as const;

/** Ключ одной анкеты вместе с составом. */
export const questionnaireKey = (portalId?: number, id?: string) =>
    [...QUESTIONNAIRES_KEY, 'item', portalId, id] as const;

/** Список анкет портала; без `appCode` — анкеты всех приложений. */
export const usePortalQuestionnaires = (
    portalId?: number,
    appCode?: QuestionnaireAppCode,
) =>
    useQuery({
        queryKey: questionnairesListKey(portalId, appCode),
        queryFn: () => helper.list(portalId as number, appCode),
        enabled: !!portalId,
    });

/** Анкета целиком — источник черновика редактора. */
export const usePortalQuestionnaire = (portalId?: number, id?: string) =>
    useQuery({
        queryKey: questionnaireKey(portalId, id),
        queryFn: () => helper.getOne(portalId as number, id as string),
        enabled: !!portalId && !!id,
    });

/** Состав анкет списка: карта «id → анкета» и флаг общей загрузки. */
export interface PortalQuestionnaireDetails {
    details: Map<string, PortalQuestionnaire>;
    isLoading: boolean;
}

/** Сборка карты составов — вынесена, чтобы `combine` не менялся каждый рендер. */
const combineDetails = (
    results: { data?: PortalQuestionnaire; isPending: boolean }[],
): PortalQuestionnaireDetails => ({
    details: new Map(
        results
            .map(result => result.data)
            .filter((item): item is PortalQuestionnaire => !!item)
            .map(item => [item.id, item]),
    ),
    isLoading: results.some(result => result.isPending),
});

/**
 * Состав анкет портала по их идентификаторам.
 *
 * Зачем отдельные запросы: список бэка условий показа НЕ отдаёт (в
 * `PortalQuestionnaireListItemDto` их нет), а таблица показывает их
 * чипсами; переключателю «Включена» состав нужен тем более — сохранение
 * задаёт его целиком. Ключи те же, что и у карточки
 * (`questionnaireKey`), поэтому редактор откроется уже из кэша.
 */
export const usePortalQuestionnaireDetails = (
    portalId: number | undefined,
    ids: string[],
): PortalQuestionnaireDetails =>
    useQueries({
        queries: ids.map(id => ({
            queryKey: questionnaireKey(portalId, id),
            queryFn: () => helper.getOne(portalId as number, id),
            enabled: !!portalId,
        })),
        combine: combineDetails,
    });

/**
 * Сохранить анкету: без `id` — создание (бэк отвечает 200 и делает upsert по
 * паре «приложение + код»), с `id` — обновление. Состав уезжает целиком:
 * вопрос, которого нет в теле, бэк гасит.
 *
 * Текст ошибки достаём разборщиком раздела: бизнес-правила приезжают в
 * `errors[]`, а не в `message`, и владельцу нужно именно правило.
 */
export const useSaveQuestionnaire = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: {
            portalId: number;
            id?: string | null;
            dto: PortalQuestionnaireSave;
        }) =>
            vars.id
                ? helper.update(vars.portalId, vars.id, vars.dto)
                : helper.create(vars.portalId, vars.dto),
        onSuccess: (saved, vars) => {
            toast.success('Анкета сохранена');
            qc.setQueryData(questionnaireKey(vars.portalId, saved.id), saved);
            void qc.invalidateQueries({
                queryKey: [...QUESTIONNAIRES_KEY, 'list', vars.portalId],
            });
        },
        onError: error =>
            toast.error('Не удалось сохранить анкету', {
                description: getQuestionnaireErrorMessage(error),
            }),
    });
};

/** Удалить анкету вместе с вопросами и вариантами (каскадом в БД). */
export const useDeleteQuestionnaire = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { portalId: number; id: string }) =>
            helper.remove(vars.portalId, vars.id),
        onSuccess: (_data, vars) => {
            toast.success('Анкета удалена');
            qc.removeQueries({
                queryKey: questionnaireKey(vars.portalId, vars.id),
            });
            void qc.invalidateQueries({
                queryKey: [...QUESTIONNAIRES_KEY, 'list', vars.portalId],
            });
        },
        onError: error =>
            toast.error('Не удалось удалить анкету', {
                description: getQuestionnaireErrorMessage(error),
            }),
    });
};
