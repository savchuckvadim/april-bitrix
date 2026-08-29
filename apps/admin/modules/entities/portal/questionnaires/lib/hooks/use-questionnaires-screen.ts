'use client';

import { useCallback, useMemo, useState } from 'react';
import {
    usePortalAppSettings,
    useSavePortalAppSettings,
} from '@/modules/entities/portal/app-settings';
import { QUESTIONNAIRE_VIEW } from '../../consts/questionnaires.const';
import type { QuestionnaireView } from '../../consts/questionnaires.const';
import { buildCheckSummary } from '../check-result-view';
import type { QuestionnaireCheckSummary } from '../check-result-view';
import {
    findQuestionnaireEventSwitch,
    formatDisabledEventTypes,
    toggleDisabledEventType,
} from '../questionnaire-event-switch';
import { buildQuestionnaireMatrix } from '../questionnaire-matrix';
import { buildQuestionnaireRows } from '../questionnaire-list-view';
import type { QuestionnaireRow } from '../questionnaire-list-view';
import { buildToggleActivePayload } from '../toggle-active-payload';
import { useCheckQuestionnaireFields } from './use-questionnaire-fields';
import { useQuestionnaireSchema } from './use-questionnaire-schema';
import {
    useDeleteQuestionnaire,
    usePortalQuestionnaireDetails,
    usePortalQuestionnaires,
    useSaveQuestionnaire,
} from './use-questionnaires';

/**
 * Экран списка анкет портала: строки таблицы и её действия.
 *
 * Панель остаётся вёрсткой — сюда собраны все запросы и решения: какие
 * строки показать, что делает переключатель «Включена», кого проверяем и
 * что удаляем. Подписи назначений, колонок и условий берутся из реестра
 * `GET /schema`, а не из констант админки.
 */
export const useQuestionnairesScreen = (portalId: number) => {
    const list = usePortalQuestionnaires(portalId);
    const schema = useQuestionnaireSchema(portalId);

    const ids = useMemo(
        () => (list.data ?? []).map(item => item.id),
        [list.data],
    );
    const { details, isLoading: isDetailsLoading } =
        usePortalQuestionnaireDetails(portalId, ids);

    const save = useSaveQuestionnaire();
    const remove = useDeleteQuestionnaire();
    const check = useCheckQuestionnaireFields();

    /**
     * Выключатель анкет по типам события.
     *
     * Живёт в настройках приложения портала и читается оттуда же, откуда
     * его читают фрейм и бэк отчёта: своего хранилища у раздела анкет нет,
     * иначе выключенным тип события оказался бы только в этой матрице.
     */
    const appSettings = usePortalAppSettings(portalId);
    const saveAppSettings = useSavePortalAppSettings();
    const eventSwitch = useMemo(
        () => findQuestionnaireEventSwitch(appSettings.data?.apps),
        [appSettings.data],
    );
    const disabledEventTypes = useMemo(
        () => eventSwitch?.disabled ?? [],
        [eventSwitch],
    );

    const rows = useMemo(
        () => buildQuestionnaireRows(list.data, details, schema.data),
        [list.data, details, schema.data],
    );

    /**
     * Разрез каталога по типам событий.
     *
     * Считается из тех же данных, что и плоский список: одна загрузка на
     * оба вида, переключение видов сети не касается.
     */
    const matrix = useMemo(
        () =>
            buildQuestionnaireMatrix(
                list.data,
                details,
                schema.data,
                disabledEventTypes,
            ),
        [list.data, details, schema.data, disabledEventTypes],
    );

    /**
     * Какой вид открыт. Матрица по умолчанию: главный вопрос владельца —
     * «что спросят на этом типе события», а не «какие анкеты есть».
     */
    const [view, setView] = useState<QuestionnaireView>(
        QUESTIONNAIRE_VIEW.matrix,
    );

    /** Анкета, для которой открыт диалог удаления. */
    const [removeTarget, setRemoveTarget] = useState<QuestionnaireRow | null>(
        null,
    );

    /**
     * Переключить «Включена»: отдельной ручки у бэка нет, поэтому анкета
     * пересохраняется целиком с одним изменённым флагом. Строка без
     * подгруженного состава и строка с запрещающей причиной сюда не
     * доходят — переключатель у них выключен.
     */
    const toggleActive = useCallback(
        (row: QuestionnaireRow) => {
            const detail = details.get(row.id);
            if (!detail || row.toggleBlockReason) return;

            save.mutate({
                portalId,
                id: detail.id,
                dto: buildToggleActivePayload(detail, !detail.isActive),
            });
        },
        [details, portalId, save],
    );

    /**
     * Итог последней сверки по строкам.
     *
     * `issuesCount` в списке считает только СЛОМАННЫЕ привязки, а сверка
     * теперь находит ещё и расхождения: переименования, появившиеся и
     * исчезнувшие варианты. Их в списке анкет взять неоткуда — они живут в
     * ответе сверки, поэтому запоминаем его прямо здесь, у кнопки.
     */
    const [checkSummaries, setCheckSummaries] = useState<
        Record<string, QuestionnaireCheckSummary>
    >({});

    /** Сверить привязки вопросов анкеты с живым Битриксом. */
    const checkFields = useCallback(
        (row: QuestionnaireRow) =>
            check.mutate(
                { portalId, id: row.id },
                {
                    onSuccess: response => {
                        const summary = buildCheckSummary(
                            response,
                            schema.data,
                        );
                        if (!summary) return;
                        setCheckSummaries(current => ({
                            ...current,
                            [row.id]: summary,
                        }));
                    },
                },
            ),
        [check, portalId, schema.data],
    );

    /**
     * Включить или выключить анкеты одного типа события.
     *
     * Пишем ровно в тот ключ, из которого читали: приложение и код берутся
     * из ответа настроек, а не набираются здесь заново. Пустой список
     * уезжает сбросом ключа — «выключено ноль типов» настройкой быть не
     * должно.
     */
    const toggleEventType = useCallback(
        (eventType: string, isDisabled: boolean) => {
            if (!eventSwitch) return;

            const next = toggleDisabledEventType(
                eventSwitch.disabled,
                eventType,
                isDisabled,
            );
            saveAppSettings.mutate({
                portalId,
                appCode: eventSwitch.appCode,
                values: {
                    [eventSwitch.code]: formatDisabledEventTypes(next),
                },
            });
        },
        [eventSwitch, portalId, saveAppSettings],
    );

    const confirmRemove = useCallback(() => {
        if (!removeTarget) return;
        remove.mutate({ portalId, id: removeTarget.id });
        setRemoveTarget(null);
    }, [portalId, remove, removeTarget]);

    return {
        rows,
        /** Каталог в разрезе по типам событий. */
        matrix,
        view,
        setView,
        /** Реестр значений: без него подписи и проверки собрать нечем. */
        schema: schema.data,
        isSchemaError: schema.isError,
        isLoading: list.isLoading,
        isListError: list.isError,
        /** Состав анкет ещё едет — условия и переключатели ждут. */
        isDetailsLoading,

        toggleActive,
        /** Какая строка сейчас пересохраняется переключателем. */
        togglingId: save.isPending ? (save.variables?.id ?? null) : null,

        /** Типы события, для которых анкеты выключены на портале. */
        disabledEventTypes,
        toggleEventType,
        /**
         * Настройки портала не прочитаны — выключателем управлять нечем.
         * Матрица при этом работает: она про анкеты, а не про настройку.
         */
        isEventSwitchReady: !!eventSwitch,
        isEventSwitchSaving: saveAppSettings.isPending,

        checkFields,
        /** Какая строка сейчас сверяет привязки. */
        checkingId: check.isPending ? (check.variables?.id ?? null) : null,
        /** Итоги сверок этого сеанса: проблемы и расхождения по строкам. */
        checkSummaries,

        removeTarget,
        askRemove: setRemoveTarget,
        confirmRemove,
        isRemoving: remove.isPending,
    };
};
