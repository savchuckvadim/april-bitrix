'use client';

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QuestionnaireFieldsHelper } from '../api/questionnaire-fields-helper';
import { buildCheckSummary } from '../check-result-view';
import { describeFieldSyncResult } from '../field-sync-view';
import { getQuestionnaireErrorMessage } from '../questionnaire-error';
import { useQuestionnaireSchema } from './use-questionnaire-schema';
import { QUESTIONNAIRES_KEY, questionnaireKey } from './use-questionnaires';
import type {
    PortalQuestionnaire,
    PortalQuestionnaireFieldSync,
    QuestionnaireField,
    QuestionnaireFieldCreate,
    QuestionnaireFieldsQuery,
} from '../../model';

const helper = new QuestionnaireFieldsHelper();

/** Корень ключей пикера полей. */
export const QUESTIONNAIRE_FIELDS_KEY = [
    'portal-questionnaire-fields',
] as const;

/**
 * Сколько живой список полей считается свежим.
 *
 * Каждый запрос — поход в Битрикс портала: без этого возврат фокуса в окно
 * перечитывал бы поля носителя заново, а редактор анкеты открыт подолгу.
 * Поля в CRM меняются руками и редко; кнопка «Проверить привязки» и
 * заведение поля инвалидируют кэш явно.
 */
const FIELDS_STALE_MS = 5 * 60 * 1000;

/**
 * Носители портала (компания, сделка, лид, контакт, смарты) и домен.
 *
 * `enabled: !!domain` — админский API адресует портал по id, а поля читает
 * из Битрикса по домену. Портал без домена бэк до Битрикса не доведёт, и
 * запрос вернул бы пустой degraded-ответ: лучше не отправлять его вовсе, а
 * показать «у портала не указан домен».
 */
export const useQuestionnaireFieldSources = (
    portalId?: number,
    domain?: string,
) =>
    useQuery({
        queryKey: [...QUESTIONNAIRE_FIELDS_KEY, 'sources', portalId, domain],
        queryFn: () => helper.getSources(portalId as number),
        enabled: !!portalId && !!domain,
        staleTime: FIELDS_STALE_MS,
    });

/**
 * UF-поля выбранного носителя. Запрос уходит, только когда носитель выбран
 * и домен портала известен.
 *
 * Ответ fail-open: недоступный портал приезжает как `degraded: true` с
 * человеческим `error` и пустым списком — это не ошибка запроса, и UI
 * обязан показать текст, а не «не удалось загрузить».
 */
export const questionnaireFieldsKey = (
    portalId: number | undefined,
    domain: string | undefined,
    query: QuestionnaireFieldsQuery | undefined,
) =>
    [
        ...QUESTIONNAIRE_FIELDS_KEY,
        'list',
        portalId,
        domain,
        query?.entity,
        query?.smartId ?? null,
        query?.onlyManual ?? false,
    ] as const;

export const useQuestionnaireFields = (
    portalId?: number,
    query?: QuestionnaireFieldsQuery,
    domain?: string,
) =>
    useQuery({
        queryKey: questionnaireFieldsKey(portalId, domain, query),
        queryFn: () =>
            helper.getFields(
                portalId as number,
                query as QuestionnaireFieldsQuery,
            ),
        enabled: !!portalId && !!domain && !!query?.entity,
        staleTime: FIELDS_STALE_MS,
    });

/** Что и как сверяем. */
export interface CheckQuestionnaireFieldsVars {
    portalId: number;
    id: string;
    /**
     * Тихий прогон: без всплывающего сообщения. Сверка при открытии
     * редактора запускается сама — сообщать об её успехе значило бы
     * встречать владельца тостом на каждом входе в анкету.
     */
    silent?: boolean;
    /**
     * Взять анкету из ответа в кэш карточки. `false` — не трогать: ответ
     * сверки сдвигает отметку проверки, а по ней редактор пересобирает
     * черновик, и несохранённые правки владельца исчезли бы без следа.
     * Кто решает, тот и кладёт (см. `useAdoptCheckedQuestionnaire`).
     */
    adopt?: boolean;
}

/**
 * Положить анкету из ответа сверки в кэш карточки.
 *
 * Нужен там, где решение «брать или не брать» принимается не в момент
 * запроса, а в момент ответа: тихая сверка стартует на чистом черновике, а
 * пока она идёт, владелец уже может печатать.
 */
export const useAdoptCheckedQuestionnaire = () => {
    const qc = useQueryClient();

    return useCallback(
        (portalId: number, id: string, questionnaire: PortalQuestionnaire) => {
            qc.setQueryData(questionnaireKey(portalId, id), questionnaire);
        },
        [qc],
    );
};

/**
 * «Проверить привязки»: сверяет поля анкеты с живым Битриксом, обновляет
 * статусы и адрес записи (`bitrixId` вариантов, гашение исчезнувших) и
 * возвращает разбор расхождений. Ответ содержит анкету целиком уже после
 * применения — её можно положить в кэш карточки вместо повторного чтения.
 * Версия анкеты проверкой не растёт, но `issuesCount` в списке меняется,
 * поэтому список освежаем всегда.
 */
export const useCheckQuestionnaireFields = () => {
    const qc = useQueryClient();
    // Реестр нужен ровно для подписей статусов в сообщении. Ключ у него
    // общий и кэш бессрочный: экран, с которого жмут кнопку, реестр уже
    // загрузил, а без него статус покажется своим кодом — не пустотой.
    const schema = useQuestionnaireSchema();

    return useMutation({
        mutationFn: (vars: CheckQuestionnaireFieldsVars) =>
            helper.check(vars.portalId, vars.id),
        onSuccess: (result, vars) => {
            if (vars.adopt !== false) {
                qc.setQueryData(
                    questionnaireKey(vars.portalId, vars.id),
                    result.questionnaire,
                );
            }
            void qc.invalidateQueries({
                queryKey: [...QUESTIONNAIRES_KEY, 'list', vars.portalId],
            });

            if (vars.silent) return;

            // Сообщение говорит ровно то же, что панель итога в редакторе:
            // одна сборка результата — одна формулировка.
            const summary = buildCheckSummary(result, schema.data);
            if (!summary) return;

            if (
                summary.degraded ||
                summary.hasProblems ||
                summary.changeCount > 0
            ) {
                toast.warning(summary.headline, {
                    description: summary.description ?? undefined,
                });
                return;
            }
            toast.success(summary.headline);
        },
        onError: (error, vars) => {
            // Тихую сверку экран показывает неброской пометкой: анкета
            // правится и без Битрикса, а красный тост поверх редактора
            // выглядел бы поломкой самой анкеты.
            if (vars.silent) return;
            toast.error('Не удалось проверить привязки', {
                description: getQuestionnaireErrorMessage(error),
            });
        },
    });
};

/**
 * «Подтянуть из Битрикса»: применяет выбранные владельцем расхождения —
 * подпись вопроса, подписи вариантов и новые варианты справочника.
 *
 * Версия анкеты растёт, поэтому ответ кладём в кэш карточки: редактор
 * пересоберёт состав уже применённым. Звать это можно только на чистом
 * черновике — иначе пересборка стёрла бы несохранённые правки (запрет
 * держит `getFieldSyncBlockReason`).
 */
export const useApplyQuestionnaireFieldSync = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (vars: {
            portalId: number;
            id: string;
            dto: PortalQuestionnaireFieldSync;
        }) => helper.applyFieldSync(vars.portalId, vars.id, vars.dto),
        onSuccess: (result, vars) => {
            qc.setQueryData(
                questionnaireKey(vars.portalId, vars.id),
                result.questionnaire,
            );
            void qc.invalidateQueries({
                queryKey: [...QUESTIONNAIRES_KEY, 'list', vars.portalId],
            });
            toast.success(describeFieldSyncResult(result));
        },
        onError: error =>
            toast.error('Не удалось подтянуть изменения из Битрикса', {
                description: getQuestionnaireErrorMessage(error),
            }),
    });
};

/** Что и в каком носителе заводим. */
export interface CreateQuestionnaireFieldVars {
    portalId: number;
    /** Домен нужен только для ключа кэша: адресует портал всё равно id. */
    domain?: string;
    dto: QuestionnaireFieldCreate;
}

/**
 * «Создать поле в носителе»: заводит поле в Битриксе портала и возвращает
 * его ровно в том виде, в каком его отдаёт список выбора — из ответа
 * сразу собирается вопрос, второго запроса не нужно.
 *
 * Ручка ДОЛГАЯ: список полей носителя, запись и чтение назад. Свой
 * таймаут стоит в хелпере, а кнопку на время запроса запирает вызывающий:
 * повтор ничего не сломает (дубля бэк не заведёт), но заставит владельца
 * ждать вдвое дольше.
 *
 * Список полей носителя после записи устаревает — в нём нет нового поля.
 * Гасим ключи списков целиком: носитель у запроса свой, и угадывать, чей
 * именно список поменялся, дороже, чем перечитать открытый.
 */
export const useCreateQuestionnaireField = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (vars: CreateQuestionnaireFieldVars) =>
            helper.createField(vars.portalId, vars.dto),
        onSuccess: result => {
            void qc.invalidateQueries({
                queryKey: [...QUESTIONNAIRE_FIELDS_KEY, 'list'],
            });

            if (result.created) {
                toast.success(
                    `Поле ${result.field.fieldName} заведено в Битриксе`,
                    { description: result.warning },
                );
                return;
            }
            // Повтор с тем же кодом: поле не создано, взято существующее —
            // молчать об этом нельзя, настройки у него могут быть свои.
            toast.warning(
                `Поле ${result.field.fieldName} в носителе уже было`,
                { description: result.warning },
            );
        },
        onError: error =>
            toast.error('Не удалось создать поле в Битриксе', {
                description: getQuestionnaireErrorMessage(error),
            }),
    });
};

/** Какое поле перечитываем и у какого носителя. */
export interface SyncQuestionnaireFieldVars {
    portalId: number;
    domain?: string;
    /** Носитель привязки: у смарта обязателен `smartId`. */
    query: QuestionnaireFieldsQuery;
    /** UF-имя привязки — по нему поле и ищется в свежем ответе. */
    fieldName: string;
}

/**
 * «Синхронизировать поле»: перечитать носителя в живом Битриксе и вернуть
 * ТЕКУЩЕЕ состояние привязанного поля — подпись, тип, значения списка с их
 * идентификаторами.
 *
 * Это не сверка привязок (`check`): та работает с СОХРАНЁННОЙ анкетой на
 * бэке и правит адрес записи в базе. Здесь владелец обновляет привязку
 * прямо в черновике — сразу после того, как поправил поле в Битриксе, не
 * сохраняя анкету ради этого.
 *
 * Кэш пикера обходится намеренно: смысл кнопки в походе за правдой, а
 * свежий ответ кладём в тот же ключ — открытый пикер обязан показать то
 * же самое.
 */
export const useSyncQuestionnaireField = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (
            vars: SyncQuestionnaireFieldVars,
        ): Promise<{ field: QuestionnaireField; degraded: boolean }> => {
            const response = await helper.getFields(vars.portalId, vars.query);
            qc.setQueryData(
                questionnaireFieldsKey(vars.portalId, vars.domain, vars.query),
                response,
            );

            const needle = vars.fieldName.trim().toUpperCase();
            const field = response.fields.find(
                item => item.fieldName.trim().toUpperCase() === needle,
            );
            if (!field) {
                throw new Error(
                    `Поле ${vars.fieldName} у носителя не нашлось: в Битриксе ` +
                        'его переименовали или удалили. Выберите поле заново.',
                );
            }
            return { field, degraded: response.degraded };
        },
        onSuccess: result =>
            toast.success(
                `Поле ${result.field.fieldName} перечитано из Битрикса`,
                {
                    description: result.degraded
                        ? 'Читали урезанным способом: идентификаторов ' +
                          'значений списка в ответе нет — привязка держится ' +
                          'на UF-имени.'
                        : undefined,
                },
            ),
        onError: error =>
            toast.error('Не удалось перечитать поле из Битрикса', {
                description: getQuestionnaireErrorMessage(error),
            }),
    });
};
