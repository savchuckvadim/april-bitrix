'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
    PortalQuestionnaire,
    PortalQuestionnaireItemSave,
    PortalQuestionnaireSchema,
    QuestionnaireAppCode,
    QuestionnaireField,
    QuestionnairePortalSmart,
} from '../../model';
import { buildCommentItem } from '../build-comment-item';
import { buildItemFromField } from '../build-item-from-field';
import type { QuestionnaireFieldOrigin } from '../build-item-from-field';
import { prepareQuestionnaireSave } from '../prepare-save-payload';
import {
    createQuestionnaireDraft,
    isSameQuestionnaireDraft,
    shouldReplaceDraft,
    toQuestionnaireDraft,
    withItemOrder,
} from '../questionnaire-draft';
import type { QuestionnaireDraft } from '../questionnaire-draft';
import { questionnairePresetSearch } from '../questionnaire-preset';
import type { QuestionnairePreset } from '../questionnaire-preset';
import { validateQuestionnaireDraft } from '../validate-questionnaire-draft';
import type { QuestionnaireDraftIssue } from '../validate-questionnaire-draft';

/** Что нужно редактору, чтобы собрать черновик. */
export interface UseQuestionnaireEditorOptions {
    /** Приложение, которому принадлежит анкета. */
    appCode: QuestionnaireAppCode;
    /** Реестр значений: без него редактор не проверяет ничего. */
    schema?: PortalQuestionnaireSchema;
    /** Сохранённая анкета; пусто — создаём новую. */
    questionnaire?: PortalQuestionnaire | null;
    /**
     * Предустановка из адреса: назначение и условие клетки матрицы, из
     * которой владелец пришёл. Работает только на создании — у сохранённой
     * анкеты состав приезжает из базы.
     */
    preset?: QuestionnairePreset | null;
    /**
     * Смарты портала: по ним проверяется, доедет ли ответ смарт-вопроса до
     * элемента. Пока список не прочитан, это правило остаётся за бэком.
     */
    smarts?: QuestionnairePortalSmart[];
}

/**
 * Черновик анкеты и операции над ним.
 *
 * Хук держит ровно тело сохранения: UI правит поля, а решение «уедет ли это
 * на бэк» принимает `validateQuestionnaireDraft` по реестру из `GET /schema`.
 * Никаких собственных правил здесь нет — иначе редактор и бэк разъехались
 * бы, и владелец получил бы 400 на кнопке, которая выглядела рабочей.
 */
export const useQuestionnaireEditor = ({
    appCode,
    schema,
    questionnaire,
    preset,
    smarts,
}: UseQuestionnaireEditorOptions) => {
    const baseline = useMemo<QuestionnaireDraft>(
        () =>
            questionnaire
                ? toQuestionnaireDraft(questionnaire)
                : createQuestionnaireDraft(appCode, schema, preset),
        [questionnaire, appCode, schema, preset],
    );

    const [draft, setDraft] = useState<QuestionnaireDraft>(baseline);

    /**
     * Отметка последней сверки привязок.
     *
     * Проверка меняет статусы вопросов, гасит исчезнувшие варианты и
     * правит `bitrixId`, но `version` анкеты НЕ поднимает — по одной
     * версии её результат в редакторе был бы не виден до перезагрузки
     * страницы.
     */
    const checkStamp = (questionnaire?.items ?? []).reduce(
        (latest, item) =>
            item.fieldCheckedAt && item.fieldCheckedAt > latest
                ? item.fieldCheckedAt
                : latest,
        '',
    );

    /**
     * Анкета и её версия: меняются только от действий владельца —
     * сохранения и перехода по адресу.
     *
     * У новой анкеты в ключ входит и предустановка: переход из соседней
     * клетки матрицы меняет только строку запроса, страница при этом не
     * перемонтируется — без предустановки в ключе редактор остался бы с
     * назначением и условием прошлой клетки.
     */
    const identityKey = questionnaire
        ? `${questionnaire.id}:${questionnaire.version}`
        : [
              'new',
              appCode,
              schema ? 'schema' : 'no-schema',
              preset ? questionnairePresetSearch(preset) : 'no-preset',
          ].join(':');

    /** Любой повод пересобрать черновик, включая сверку привязок. */
    const baselineKey = `${identityKey}:${checkStamp}`;

    /** Из чего собран текущий черновик — по нему и видно правки владельца. */
    const appliedRef = useRef({ identityKey, baseline });

    useEffect(() => {
        const applied = appliedRef.current;
        appliedRef.current = { identityKey, baseline };

        setDraft(current =>
            shouldReplaceDraft({
                isIdentityChanged: applied.identityKey !== identityKey,
                // Сравниваем с тем составом, ИЗ КОТОРОГО черновик собран:
                // сверка правит адресные поля, и сравнение с новым
                // составом объявило бы её правки правками владельца.
                hasEdits: !isSameQuestionnaireDraft(current, applied.baseline),
            })
                ? baseline
                : current,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baselineKey]);

    /** Правка шапки анкеты: название, назначение, условия, флаги. */
    const patchDraft = useCallback((patch: Partial<QuestionnaireDraft>) => {
        setDraft(current => ({ ...current, ...patch }));
    }, []);

    /** Правка одного вопроса по его месту в списке. */
    const patchItem = useCallback(
        (index: number, patch: Partial<PortalQuestionnaireItemSave>) => {
            setDraft(current => ({
                ...current,
                items: current.items.map((item, position) =>
                    position === index ? { ...item, ...patch } : item,
                ),
            }));
        },
        [],
    );

    /**
     * Добавить вопросы из выбранных полей носителя. Коды вопросов уникальны
     * внутри анкеты, поэтому занятые собираются по всему черновику, а не
     * только по добавляемой пачке.
     */
    const addItems = useCallback(
        (fields: QuestionnaireField[], origin: QuestionnaireFieldOrigin) => {
            setDraft(current => {
                const taken = new Set(current.items.map(item => item.code));
                const added = fields.map(field => {
                    const item = buildItemFromField(field, schema, {
                        ...origin,
                        takenCodes: taken,
                    });
                    taken.add(item.code);
                    return item;
                });

                return {
                    ...current,
                    items: withItemOrder([...current.items, ...added]),
                };
            });
        },
        [schema],
    );

    /**
     * Пункт без поля: ответ уйдёт в комментарий события. Нужен для случая
     * «поля пока нет» — вопрос уже задаётся, ответ уже виден в истории.
     */
    const addCommentItem = useCallback(() => {
        setDraft(current => ({
            ...current,
            items: withItemOrder([
                ...current.items,
                buildCommentItem(
                    schema,
                    current.items.map(item => item.code),
                ),
            ]),
        }));
    }, [schema]);

    /**
     * Убрать вопрос из состава ФИЗИЧЕСКИ.
     *
     * Так можно только с вопросом, которого ещё нет в базе: у сохранённого
     * вопроса код — ключ уже собранных ответов, и его убирают гашением
     * (`isActive: false`), иначе ответы в CRM останутся без вопроса.
     */
    const removeItem = useCallback((index: number) => {
        setDraft(current => ({
            ...current,
            items: withItemOrder(
                current.items.filter((_item, position) => position !== index),
            ),
        }));
    }, []);

    /** Перенести вопрос: порядок в списке = порядок у менеджера. */
    const reorder = useCallback((from: number, to: number) => {
        setDraft(current => {
            const items = [...current.items];
            const moved = items[from];
            if (from === to || !moved || to < 0 || to >= items.length) {
                return current;
            }

            items.splice(from, 1);
            items.splice(to, 0, moved);
            return { ...current, items: withItemOrder(items) };
        });
    }, []);

    /** Вернуть черновик к сохранённому состоянию. */
    const reset = useCallback(() => setDraft(baseline), [baseline]);

    /**
     * Тело, которое уедет на бэк. Черновик хранит и то, что для текущего
     * выбора ничего не значит (варианты у не-списка, путь в отчёте у канала
     * CRM), — иначе переключение типа туда-обратно теряло бы разметку.
     */
    const payload = useMemo<QuestionnaireDraft>(
        () => prepareQuestionnaireSave(draft, questionnaire),
        [draft, questionnaire],
    );

    // Проверяем именно тело сохранения: список нарушений обязан описывать
    // то, что реально уедет, а не то, что редактор придержал у себя.
    const issues = useMemo<QuestionnaireDraftIssue[]>(
        () => validateQuestionnaireDraft(payload, schema, { smarts }),
        [payload, schema, smarts],
    );

    const isDirty = !isSameQuestionnaireDraft(draft, baseline);

    return {
        draft,
        /** Готовое тело `POST`/`PUT`. */
        payload,
        patchDraft,
        patchItem,
        addItems,
        addCommentItem,
        removeItem,
        reorder,
        reset,
        isDirty,
        /** Все нарушения правил бэка разом — UI подсвечивает по `scope`. */
        issues,
        isValid: issues.length === 0,
        /** Пересчёт по требованию (кнопка «Сохранить» перед отправкой). */
        validate: () => validateQuestionnaireDraft(payload, schema, { smarts }),
    };
};
