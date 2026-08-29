'use client';

import { useCallback, useMemo, useState } from 'react';
import type {
    PortalQuestionnaireSchema,
    QuestionnaireField,
    QuestionnaireFieldSource,
} from '../../model';
import {
    addFieldOption,
    applyFieldTitle,
    buildFieldCreatePayload,
    buildFieldTypeOptions,
    createFieldDraft,
    describeCreatedFieldReject,
    describeFieldCreateBlockReason,
    describeFieldCreateProblem,
    needsFieldOptions,
} from '../field-create-view';
import { useCreateQuestionnaireField } from './use-questionnaire-fields';

/** Что нужно форме, чтобы завести поле и отдать его пикеру. */
export interface UseFieldCreateFormOptions {
    portalId: number;
    domain: string | undefined;
    schema: PortalQuestionnaireSchema | undefined;
    /** Носитель, в котором заводим поле: он же уедет в тело запроса. */
    source: QuestionnaireFieldSource | undefined;
    /** Причина, по которой поля носителя недоступны целиком. */
    sourceBlockReason: string | null;
    /** Поля носителя читались урезанным способом — прав на запись нет. */
    isDegraded: boolean;
    /** Поле заведено: пикер сразу собирает из него вопрос. */
    onCreated: (field: QuestionnaireField) => void;
}

/**
 * Форма «завести поле в носителе».
 *
 * Черновик и его правила живут здесь, а не в диалоге: те же правила
 * проверяет бэк, и разъехаться им нельзя — владелец обязан прочитать
 * причину до нажатия, а не в тексте отказа.
 *
 * Запрос ДОЛГИЙ (список полей носителя, запись, чтение назад), поэтому
 * кнопка запирается на всё время: повтор дубля не заведёт, но заставит
 * ждать вдвое дольше.
 */
export const useFieldCreateForm = ({
    portalId,
    domain,
    schema,
    source,
    sourceBlockReason,
    isDegraded,
    onCreated,
}: UseFieldCreateFormOptions) => {
    const [draft, setDraft] = useState(() => createFieldDraft(schema));
    /**
     * Код перестаёт ехать за подписью, как только владелец правит его сам:
     * из кода собирается имя поля в Битриксе, и затирать выбранное чужим
     * транслитом нельзя.
     */
    const [isCodeTouched, setIsCodeTouched] = useState(false);
    /**
     * Почему поле из ответа в вопрос не уехало; `null` — уехало.
     *
     * Живёт отдельно от `problem`: тот про черновик и считается на каждый
     * ввод, а это приговор УЖЕ ЗАВЕДЁННОМУ полю — он держится до
     * следующей отправки, иначе владелец увидел бы закрытую панель и
     * никакого вопроса.
     */
    const [rejectReason, setRejectReason] = useState<string | null>(null);
    const create = useCreateQuestionnaireField();

    const types = useMemo(() => buildFieldTypeOptions(schema), [schema]);
    const withOptions = needsFieldOptions(schema, draft.type);

    const setTitle = useCallback(
        (title: string) =>
            setDraft(current => applyFieldTitle(current, title, isCodeTouched)),
        [isCodeTouched],
    );

    const setCode = useCallback((code: string) => {
        setIsCodeTouched(true);
        setDraft(current => ({ ...current, code: code.toUpperCase() }));
    }, []);

    const setType = useCallback(
        (type: string) => setDraft(current => ({ ...current, type })),
        [],
    );

    const setRequired = useCallback(
        (isRequired: boolean) =>
            setDraft(current => ({ ...current, isRequired })),
        [],
    );

    const setOptionTitle = useCallback((key: string, title: string) => {
        setDraft(current => ({
            ...current,
            options: current.options.map(option =>
                option.key === key ? { ...option, title } : option,
            ),
        }));
    }, []);

    const addOption = useCallback(
        () =>
            setDraft(current => ({
                ...current,
                options: addFieldOption(current.options),
            })),
        [],
    );

    const removeOption = useCallback((key: string) => {
        setDraft(current => ({
            ...current,
            options: current.options.filter(option => option.key !== key),
        }));
    }, []);

    const reset = useCallback(() => {
        setDraft(createFieldDraft(schema));
        setIsCodeTouched(false);
        setRejectReason(null);
    }, [schema]);

    /** Почему завести поле в этом носителе нельзя; `null` — можно. */
    const blockReason = describeFieldCreateBlockReason(
        source,
        sourceBlockReason,
        isDegraded,
    );
    /** Что мешает отправить форму; `null` — черновик готов. */
    const problem = describeFieldCreateProblem(draft, schema);

    const submit = useCallback(() => {
        if (!source || blockReason || problem || create.isPending) return;
        setRejectReason(null);

        create.mutate(
            {
                portalId,
                domain,
                dto: buildFieldCreatePayload(draft, source, schema),
            },
            {
                onSuccess: result => {
                    // Поле уже прочитано из Битрикса — вопрос собирается
                    // прямо из ответа, второго запроса не нужно. Но
                    // сначала тот же приговор, что у списка выбора:
                    // повтор кода возвращает УЖЕ заведённое поле, а оно
                    // бывает множественным или чужого типа — такой вопрос
                    // добавился бы в состав и запер сохранение анкеты.
                    const reject = describeCreatedFieldReject(
                        result,
                        schema,
                        sourceBlockReason,
                    );
                    if (reject) {
                        // Черновик остаётся набранным: владельцу менять в
                        // нём код, а не набирать форму заново.
                        setRejectReason(reject);
                        return;
                    }

                    reset();
                    onCreated(result.field);
                },
            },
        );
    }, [
        blockReason,
        create,
        domain,
        draft,
        onCreated,
        portalId,
        problem,
        reset,
        schema,
        source,
        sourceBlockReason,
    ]);

    return {
        draft,
        /** Типы поля из матрицы реестра — своего списка у формы нет. */
        types,
        /** Типу нужен справочник значений. */
        withOptions,
        setTitle,
        setCode,
        setType,
        setRequired,
        setOptionTitle,
        addOption,
        removeOption,
        reset,
        blockReason,
        problem,
        /** Поле завелось (или нашлось), но вопрос из него не собрать. */
        rejectReason,
        submit,
        isCreating: create.isPending,
    };
};
