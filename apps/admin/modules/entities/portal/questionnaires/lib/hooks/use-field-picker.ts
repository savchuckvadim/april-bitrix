'use client';

import { useCallback, useMemo, useState } from 'react';
import type {
    PortalQuestionnaireCondition,
    PortalQuestionnaireSchema,
    QuestionnaireField,
    QuestionnaireFieldSource,
} from '../../model';
import type { QuestionnaireFieldOrigin } from '../build-item-from-field';
import {
    buildFieldPickerRows,
    buildFieldSourceOptions,
    countSelectableRows,
    describeDegradedNotice,
    describeSmartSource,
    describeSourceNotice,
    fieldSourceKey,
} from '../field-picker-view';
import type { QuestionnaireFieldRow } from '../field-picker-view';
import { usePortalSmarts } from './use-portal-smarts';
import {
    useQuestionnaireFieldSources,
    useQuestionnaireFields,
} from './use-questionnaire-fields';

/** Что нужно пикеру, чтобы показать поля и решить, что из них годится. */
export interface UseFieldPickerOptions {
    portalId: number;
    domain: string | undefined;
    schema: PortalQuestionnaireSchema | undefined;
    /**
     * Условия показа анкеты.
     *
     * От них зависит, доступны ли поля смарта: ответ уедет в элемент,
     * который заводит поток события, и анкета обязана быть привязана к
     * типу события этого потока. Владелец выбирает тип события в условиях —
     * пикер после этого показывает, поля какого смарта ему открылись.
     */
    conditions: PortalQuestionnaireCondition[];
    /** Замена поля у одного вопроса: отметка здесь может быть только одна. */
    single?: boolean;
}

/**
 * Пикер полей: носитель, фильтры и отмеченные поля.
 *
 * Поля читаются из живого Битрикса по домену портала, поэтому запрос уходит
 * один на носителя, а поиск и «только созданные вручную» считаются уже на
 * загруженном списке — переключение фильтра не должно стоить похода в
 * Битрикс.
 */
export const useFieldPicker = ({
    portalId,
    domain,
    schema,
    conditions,
    single = false,
}: UseFieldPickerOptions) => {
    const sourcesQuery = useQuestionnaireFieldSources(portalId, domain);
    const sources = useMemo(
        () => sourcesQuery.data?.sources ?? [],
        [sourcesQuery.data],
    );
    // Строки `smarts` портала: по ним смарт-носитель опознаётся как поток
    // события — в списке носителей этого не написано.
    const portalSmarts = usePortalSmarts(portalId);

    const [sourceKey, setSourceKey] = useState<string>('');
    /** Носитель по умолчанию — первый в ответе (штатные идут раньше смартов). */
    const source: QuestionnaireFieldSource | undefined = useMemo(
        () =>
            sources.find(item => fieldSourceKey(item) === sourceKey) ??
            sources[0],
        [sources, sourceKey],
    );

    const fieldsQuery = useQuestionnaireFields(
        portalId,
        source
            ? {
                  entity: source.entity,
                  // У штатной сущности идентификатора смарта нет: в query
                  // он не уходит вовсе, поэтому `undefined`, а не `null`.
                  smartId: source.smartId ?? undefined,
              }
            : undefined,
        domain,
    );

    const [search, setSearch] = useState('');
    const [onlyManual, setOnlyManual] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);

    /**
     * Разбор смарт-носителя: куда уедет ответ и уедет ли. Штатный носитель
     * даёт `null` — там адресация ответа никаких вопросов не вызывает.
     */
    const smartSource = useMemo(
        () =>
            describeSmartSource(
                source,
                portalSmarts.smarts,
                conditions,
                schema,
            ),
        [source, portalSmarts.smarts, conditions, schema],
    );
    /** Причина, по которой поля носителя нельзя взять целиком. */
    const sourceBlockReason = smartSource?.blockReason ?? null;

    /** Носители с пометкой: чьи поля анкете сейчас доступны. */
    const sourceOptions = useMemo(
        () =>
            buildFieldSourceOptions(
                sources,
                portalSmarts.smarts,
                conditions,
                schema,
            ),
        [sources, portalSmarts.smarts, conditions, schema],
    );

    /**
     * Весь список носителя без фильтров: по нему решается, что вообще
     * можно отметить, и по нему собираются отмеченные поля. Считать
     * отметки по видимым строкам нельзя — набранный поиск «терял» бы уже
     * выбранное поле вместе с его вариантами справочника.
     */
    const allRows = useMemo<QuestionnaireFieldRow[]>(
        () =>
            buildFieldPickerRows(
                fieldsQuery.data?.fields,
                schema,
                sourceBlockReason,
            ),
        [fieldsQuery.data, schema, sourceBlockReason],
    );

    const rows = useMemo<QuestionnaireFieldRow[]>(
        () =>
            buildFieldPickerRows(
                fieldsQuery.data?.fields,
                schema,
                sourceBlockReason,
                { search, onlyManual },
            ),
        [fieldsQuery.data, schema, sourceBlockReason, search, onlyManual],
    );

    /** Отметить поле; непригодное отметить нельзя — его вопрос не сохранить. */
    const toggle = useCallback(
        (fieldName: string) => {
            const row = allRows.find(
                item => item.field.fieldName === fieldName,
            );
            if (!row || row.rejectReason) return;

            setSelected(current => {
                if (current.includes(fieldName)) {
                    return current.filter(name => name !== fieldName);
                }
                // Вопросу привязывается ровно одно поле: отмечать пачку и
                // молча брать из неё первое значило бы врать кнопкой.
                return single ? [fieldName] : [...current, fieldName];
            });
        },
        [allRows, single],
    );

    /** Смена носителя сбрасывает отметки: поля у носителей разные. */
    const selectSource = useCallback((key: string) => {
        setSourceKey(key);
        setSelected([]);
    }, []);

    const reset = useCallback(() => {
        setSelected([]);
        setSearch('');
    }, []);

    /** Отмеченные поля в порядке списка носителя. */
    const selectedFields = useMemo<QuestionnaireField[]>(
        () =>
            allRows
                .filter(
                    row =>
                        !row.rejectReason &&
                        selected.includes(row.field.fieldName),
                )
                .map(row => row.field),
        [allRows, selected],
    );

    /**
     * Откуда взяты отмеченные поля. У смарта одного носителя мало: в какую
     * строку `smarts` уедет ответ, говорит только `smartId` — и он же
     * единственное, что бэк из привязки хранит.
     */
    const origin = useMemo<QuestionnaireFieldOrigin | null>(
        () =>
            source ? { source: source.entity, smartId: source.smartId } : null,
        [source],
    );

    return {
        sources,
        /** Список носителей для селекта — с пометкой доступности. */
        sourceOptions,
        source,
        sourceKey: source ? fieldSourceKey(source) : '',
        selectSource,
        origin,
        /** Ограничение носителя целиком либо адрес, по которому уедет ответ. */
        sourceNotice: describeSourceNotice(source, smartSource),
        /** Почему поля носителя взять нельзя целиком; `null` — можно. */
        sourceBlockReason,
        /**
         * Поля читались урезанным способом. Для создания поля это приговор:
         * `userfieldconfig` пишет только администратор CRM, а читающий
         * `crm.item.fields` писать не умеет вовсе.
         */
        isDegraded: fieldsQuery.data?.degraded === true,

        rows,
        /** Сколько строк носителя вообще можно отметить. */
        selectableCount: countSelectableRows(rows),
        search,
        setSearch,
        onlyManual,
        setOnlyManual,

        selected,
        selectedFields,
        toggle,
        reset,

        isLoading:
            sourcesQuery.isLoading ||
            fieldsQuery.isLoading ||
            portalSmarts.isLoading,
        isError: sourcesQuery.isError || fieldsQuery.isError,
        /** Поля читались урезанным способом: без bitrixId привязку не сохранить. */
        degradedNotice: describeDegradedNotice(fieldsQuery.data),
    };
};
