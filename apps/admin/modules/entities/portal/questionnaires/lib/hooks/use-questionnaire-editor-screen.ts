'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePortal } from '@/modules/entities/portal/hooks/use-get-portal';
import { usePortalAppSettings } from '@/modules/entities/portal/app-settings';
import {
    QUESTIONNAIRE_EDITOR_TEXT,
    QUESTIONNAIRE_NEW_ID,
} from '../../consts/questionnaires.const';
import type {
    PortalQuestionnaireItemSave,
    PortalQuestionnaireItemSync,
    QuestionnaireCheckResponse,
    QuestionnaireField,
    QuestionnairePurpose,
} from '../../model';
import { QUESTIONNAIRE_CODE } from '../../model';
import { applyFieldToItem, syncFieldInItem } from '../build-item-from-field';
import type { QuestionnaireFieldOrigin } from '../build-item-from-field';
import { buildCheckSummary } from '../check-result-view';
import {
    buildFieldSyncReport,
    canAdoptCheckedQuestionnaire,
    getFieldSyncBlockReason,
} from '../field-sync-view';
import type { QuestionnaireSyncItem } from '../field-sync-view';
import { getQuestionnaireErrorMessage } from '../questionnaire-error';
import {
    useAdoptCheckedQuestionnaire,
    useApplyQuestionnaireFieldSync,
    useCheckQuestionnaireFields,
    useSyncQuestionnaireField,
} from './use-questionnaire-fields';
import { defaultPlaceForPurpose } from '../questionnaire-draft';
import { parseQuestionnairePreset } from '../questionnaire-preset';
import {
    findQuestionnaireCodeConflict,
    questionnaireCodeGuard,
    toQuestionnaireCode,
} from '../questionnaire-code';
import type { QuestionnaireCodeGuard } from '../questionnaire-code';
import { usePortalSmarts } from './use-portal-smarts';
import { useQuestionnaireEditor } from './use-questionnaire-editor';
import { useQuestionnaireSchema } from './use-questionnaire-schema';
import {
    usePortalQuestionnaire,
    usePortalQuestionnaires,
    useSaveQuestionnaire,
} from './use-questionnaires';

/** Почему сохранение заперто, пока код не проверен по списку анкет. */
const CODE_GUARD_TEXT: Record<QuestionnaireCodeGuard, string> = {
    pending: QUESTIONNAIRE_EDITOR_TEXT.codeCheckPending,
    failed: QUESTIONNAIRE_EDITOR_TEXT.codeCheckFailed,
};

/** Что открыто в пикере: добавление вопросов или замена поля у вопроса. */
export type FieldPickerTarget =
    | { mode: 'add' }
    | { mode: 'replace'; index: number };

/** Последняя сверка и то, как её запустили. */
interface QuestionnaireCheckState {
    response: QuestionnaireCheckResponse;
    /**
     * Сверка шла сама при открытии. Итог статусов такой сверки на экран не
     * выносим: панель «Проверка привязок» — ответ на нажатую кнопку, а не
     * приветствие при каждом входе в редактор. Разбор расхождений
     * показывается в обоих случаях: он и есть то, ради чего сверка тихо
     * запускается.
     */
    isSilent: boolean;
}

/**
 * Экран редактора анкеты: одна страница на всю анкету.
 *
 * Мастера здесь нет намеренно — шапка, условия показа и состав правятся
 * рядом, потому что смысл каждого куска виден только вместе с остальными:
 * условие «тип отчётного события» значит одно у анкеты отчёта и другое у
 * анкеты планирования.
 */
export const useQuestionnaireEditorScreen = (
    portalId: number,
    questionnaireId: string,
) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isNew = questionnaireId === QUESTIONNAIRE_NEW_ID;

    const schemaQuery = useQuestionnaireSchema(portalId);
    const questionnaireQuery = usePortalQuestionnaire(
        portalId,
        isNew ? undefined : questionnaireId,
    );
    // Список нужен ровно для одного: код анкеты — ключ upsert-а, и занятый
    // код молча заменил бы чужую анкету вместе с её составом.
    const listQuery = usePortalQuestionnaires(portalId);
    const portalQuery = usePortal(portalId);
    const appsQuery = usePortalAppSettings(portalId);
    // Смарты портала нужны и проверке черновика, и пикеру: по ним видно,
    // какой поток события ведёт элементы выбранного смарта.
    const portalSmarts = usePortalSmarts(portalId);

    const domain = portalQuery.data?.domain;
    const schema = schemaQuery.data;
    const saved = isNew ? null : questionnaireQuery.data;

    /** Коды приложений портала: своего реестра у анкет для них нет. */
    const appCodes = useMemo(
        () => (appsQuery.data?.apps ?? []).map(block => block.appCode),
        [appsQuery.data],
    );

    /**
     * Предустановка из адреса — клетка матрицы, из которой владелец пришёл.
     *
     * Только для новой анкеты: у сохранённой назначение и условия приезжают
     * из базы, и адрес не имеет права их переписывать — по такой ссылке
     * правка живой анкеты выглядела бы как её собственный состав.
     */
    const preset = useMemo(
        () => (isNew ? parseQuestionnairePreset(searchParams, schema) : null),
        [isNew, searchParams, schema],
    );

    const editor = useQuestionnaireEditor({
        // Последний дефолт нужен, пока настройки приложений едут: экран в
        // это время показывает загрузку, и до селекта он не доживает.
        appCode:
            saved?.appCode ?? appCodes[0] ?? QUESTIONNAIRE_CODE.appCode.portal,
        schema,
        questionnaire: saved,
        preset,
        smarts: portalSmarts.smarts,
    });
    const { draft, patchDraft, patchItem, addItems } = editor;

    const save = useSaveQuestionnaire();

    /**
     * Название задаёт код, пока анкета не создана.
     *
     * Код — стабильный ключ ответов: у сохранённой анкеты он read-only, и
     * трогать его нельзя даже нам.
     */
    const setTitle = useCallback(
        (title: string) => {
            patchDraft(
                isNew ? { title, code: toQuestionnaireCode(title) } : { title },
            );
        },
        [isNew, patchDraft],
    );

    /**
     * Назначение тянет за собой колонку: бэк, получив пустую, подставляет
     * колонку по назначению. Редактор делает это явно, иначе предпросмотр
     * показывал бы «колонка не выбрана» там, где она уже определена.
     */
    const setPurpose = useCallback(
        (purpose: QuestionnairePurpose) => {
            patchDraft({
                purpose,
                place: defaultPlaceForPurpose(purpose, schema),
            });
        },
        [patchDraft, schema],
    );

    /** Анкета, которую перезапишет сохранение под этим кодом. */
    const codeConflict = useMemo(
        () =>
            findQuestionnaireCodeConflict(
                listQuery.data,
                draft.appCode,
                draft.code,
                saved?.id,
            ),
        [listQuery.data, draft.appCode, draft.code, saved?.id],
    );

    /**
     * Пока список не прочитан, пустой `codeConflict` не значит «код
     * свободен» — он значит «мы не знаем», и сохранение заперто: POST
     * делает upsert и заменил бы чужую анкету вместе с её составом.
     */
    const codeGuard = questionnaireCodeGuard(isNew, listQuery);

    // ---------------- пикер полей ----------------
    const [pickerTarget, setPickerTarget] = useState<FieldPickerTarget | null>(
        null,
    );

    const applyPickedFields = useCallback(
        (fields: QuestionnaireField[], origin: QuestionnaireFieldOrigin) => {
            if (!pickerTarget || fields.length === 0) {
                setPickerTarget(null);
                return;
            }

            if (pickerTarget.mode === 'add') {
                addItems(fields, origin);
            } else {
                // Замена привязки: вопрос остаётся тем же (код — ключ уже
                // собранных ответов), меняется только поле.
                const field = fields[0] as QuestionnaireField;
                const current = draft.items[
                    pickerTarget.index
                ] as PortalQuestionnaireItemSave;
                patchItem(
                    pickerTarget.index,
                    applyFieldToItem(current, field, schema, origin),
                );
            }
            setPickerTarget(null);
        },
        [pickerTarget, addItems, draft.items, patchItem, schema],
    );

    // ---------------- синхронизация одного поля ----------------
    const fieldSync = useSyncQuestionnaireField();
    const { mutate: mutateFieldSync } = fieldSync;
    /** Какой вопрос сейчас перечитывается; `null` — ни один. */
    const [syncingItemIndex, setSyncingItemIndex] = useState<number | null>(
        null,
    );

    /**
     * Перечитать поле вопроса из живого Битрикса и обновить привязку.
     *
     * Отличается от сверки привязок (`runCheck`) тем, ЧТО правит: сверка
     * ходит за сохранённой анкетой на бэк, а это — правка ЧЕРНОВИКА сразу
     * после того, как владелец поправил поле в портале. Код вопроса при
     * этом остаётся прежним: он ключ уже собранных ответов, и менять его
     * из-за переименования поля нельзя.
     *
     * Правится ровно привязка: адрес поля, его тип и идентификаторы
     * элементов списка. Формулировка вопроса и подписи вариантов — текст
     * владельца, кнопка их не переписывает; переименованное в портале
     * показывает карточка живого поля, и подтягивается оно поштучно.
     */
    const syncItemField = useCallback(
        (index: number) => {
            const item = draft.items[index];
            if (!item?.fieldName || !item.fieldSource) return;

            const origin = {
                source: item.fieldSource,
                smartId: item.smartId ?? null,
            };
            setSyncingItemIndex(index);
            mutateFieldSync(
                {
                    portalId,
                    domain,
                    query: {
                        entity: item.fieldSource,
                        // У штатной сущности идентификатора смарта нет: в
                        // запрос он не уходит вовсе.
                        smartId: item.smartId ?? undefined,
                    },
                    fieldName: item.fieldName,
                },
                {
                    onSuccess: result =>
                        patchItem(
                            index,
                            syncFieldInItem(item, result.field, schema, origin),
                        ),
                    onSettled: () => setSyncingItemIndex(null),
                },
            );
        },
        [domain, draft.items, mutateFieldSync, patchItem, portalId, schema],
    );

    // ---------------- проверка привязок ----------------
    const check = useCheckQuestionnaireFields();
    const adoptChecked = useAdoptCheckedQuestionnaire();
    const applySync = useApplyQuestionnaireFieldSync();
    // Запуск мутации у react-query стабилен между рендерами, а сам объект
    // мутации — нет: держим в зависимостях именно его, иначе сверка при
    // открытии перезапускалась бы на каждый рендер.
    const { mutate: mutateCheck } = check;
    const { mutate: mutateApplySync } = applySync;
    const [checkState, setCheckState] =
        useState<QuestionnaireCheckState | null>(null);
    const [silentError, setSilentError] = useState<string | null>(null);
    const [isSyncHidden, setIsSyncHidden] = useState(false);
    /** Что владелец отметил к подтягиванию; пусто — умолчания разбора. */
    const [syncPicks, setSyncPicks] = useState<Record<string, boolean>>({});

    const showCheckResult = useCallback(
        (response: QuestionnaireCheckResponse, isSilent: boolean) => {
            setCheckState({ response, isSilent });
            setIsSyncHidden(false);
            // Разбор новый — отметки к его строкам отношения не имеют:
            // прежняя галочка утащила бы в тело то, чего владелец в этом
            // разборе не видел.
            setSyncPicks({});
        },
        [],
    );

    /**
     * Есть ли прямо сейчас несохранённые правки.
     *
     * Именно ref, а не значение: тихая сверка стартует на чистом
     * черновике, но пока она идёт, владелец уже печатает — а решение
     * «брать ли анкету из ответа в кэш» принимается в момент ОТВЕТА.
     */
    const isDirtyRef = useRef(editor.isDirty);
    useEffect(() => {
        isDirtyRef.current = editor.isDirty;
    }, [editor.isDirty]);

    /**
     * Тихая сверка: в фоне, без блокировки экрана и без сообщения об
     * успехе. Ошибку показываем неброской пометкой — анкета правится и без
     * Битрикса.
     *
     * Анкету из ответа берём в кэш ТОЛЬКО на чистом черновике. Ответ
     * сверки сдвигает отметку проверки, а по ней редактор пересобирает
     * черновик: на грязном это стёрло бы набранное владельцем молча и
     * безвозвратно. Адресные правки сверки (`bitrixId`, гашение) в этом
     * случае приедут следующим чтением анкеты — после сохранения.
     */
    const runSilentCheck = useCallback(
        (id: string) => {
            setSilentError(null);
            mutateCheck(
                { portalId, id, silent: true, adopt: false },
                {
                    onSuccess: response => {
                        showCheckResult(response, true);
                        const decision = canAdoptCheckedQuestionnaire({
                            isDirty: isDirtyRef.current,
                        });
                        if (!decision.adopt) return;
                        adoptChecked(portalId, id, response.questionnaire);
                    },
                    onError: error =>
                        setSilentError(getQuestionnaireErrorMessage(error)),
                },
            );
        },
        [adoptChecked, mutateCheck, portalId, showCheckResult],
    );

    /**
     * Сверка при открытии анкеты — сама, один раз.
     *
     * Отдельной кнопки для этого не нужно: владелец должен видеть, что в
     * Битриксе изменилось, ещё до того, как задумается проверять. Повтор
     * запускает кнопка «Проверить привязки».
     */
    const checkedIdRef = useRef<string | null>(null);
    useEffect(() => {
        const id = saved?.id;
        if (!id || checkedIdRef.current === id) return;
        checkedIdRef.current = id;
        runSilentCheck(id);
    }, [runSilentCheck, saved?.id]);

    /**
     * Почему сверять нечего; `null` — кнопка доступна.
     *
     * Проверка ходит в Битрикс за полями СОХРАНЁННОЙ анкеты и переписывает
     * статусы её вопросов. Для черновика на экране это бессмысленно: поля
     * вопроса, которого в базе ещё нет, проверять негде — и результат
     * пришёл бы про прежний состав.
     */
    const checkBlockReason = isNew
        ? QUESTIONNAIRE_EDITOR_TEXT.checkNew
        : editor.isDirty
          ? QUESTIONNAIRE_EDITOR_TEXT.checkUnsaved
          : null;

    const runCheck = useCallback(() => {
        if (!saved || checkBlockReason) return;
        setSilentError(null);
        mutateCheck(
            { portalId, id: saved.id },
            { onSuccess: response => showCheckResult(response, false) },
        );
    }, [mutateCheck, checkBlockReason, portalId, saved, showCheckResult]);

    /** Итог проверки, разобранный по вопросам; у тихой сверки его нет. */
    const checkSummary = useMemo(
        () =>
            checkState && !checkState.isSilent
                ? buildCheckSummary(checkState.response, schema)
                : null,
        [checkState, schema],
    );

    const hideCheckResult = useCallback(() => {
        setCheckState(null);
        setSilentError(null);
    }, []);

    // ---------------- расхождения с Битриксом ----------------

    const report = useMemo(
        () => buildFieldSyncReport(checkState?.response, schema, syncPicks),
        [checkState, schema, syncPicks],
    );

    /**
     * Отметка одной строки разбора.
     *
     * Тело применения собирается из отметок, поэтому подпись поля уезжает
     * только по прямому согласию владельца: раньше она уходила заодно с
     * новым вариантом списка и затирала формулировку вопроса навсегда.
     */
    const toggleSyncPick = useCallback((pickKey: string, isPicked: boolean) => {
        setSyncPicks(prev => ({ ...prev, [pickKey]: isPicked }));
    }, []);

    /**
     * Разбор для панели; `null` — панель не рисуем. Пустой разбор её не
     * открывает: «В Битриксе изменилось» с пустым списком было бы шумом на
     * каждом открытии анкеты.
     */
    const syncReport =
        !isSyncHidden && report && report.changeCount > 0 ? report : null;

    /**
     * Неброская пометка под шапкой.
     *
     * Тихая сверка не должна ни блокировать экран, ни всплывать тостом:
     * анкета редактируется и без Битрикса. Причина неполного чтения
     * попадает сюда, только если панели нет, — иначе она уже написана в
     * самой панели.
     */
    const checkNotice = silentError
        ? `${QUESTIONNAIRE_EDITOR_TEXT.checkSilentError} ${silentError}`
        : syncReport
          ? null
          : (report?.degradedReason ?? null);

    /**
     * Почему подтянуть нельзя; `null` — можно. Главное правило раздела:
     * несохранённые правки владельца не должен затирать ни один фоновый
     * ответ — поэтому на грязном черновике применение заперто, а не
     * «предупреждает и всё равно делает».
     */
    const syncBlockReason = getFieldSyncBlockReason({
        isDirty: editor.isDirty,
        isApplying: applySync.isPending,
    });

    const runApplySync = useCallback(
        (items: PortalQuestionnaireItemSync[]) => {
            if (!saved || syncBlockReason || items.length === 0) return;
            mutateApplySync(
                { portalId, id: saved.id, dto: { items } },
                {
                    // Разбор устарел: часть строк применена, остальные
                    // нужно пересчитать по живому Битриксу — иначе панель
                    // предлагала бы подтянуть уже подтянутое.
                    onSuccess: () => runSilentCheck(saved.id),
                },
            );
        },
        [mutateApplySync, portalId, runSilentCheck, saved, syncBlockReason],
    );

    /** Подтянуть все расхождения разом. */
    const applyAllSync = useCallback(() => {
        if (!syncReport?.payload) return;
        runApplySync(syncReport.payload.items);
    }, [runApplySync, syncReport]);

    /** Подтянуть расхождения одного вопроса. */
    const applyItemSync = useCallback(
        (item: QuestionnaireSyncItem) => {
            if (!item.payload) return;
            runApplySync([item.payload]);
        },
        [runApplySync],
    );

    const hideSyncReport = useCallback(() => setIsSyncHidden(true), []);

    // ---------------- сохранение ----------------
    const canSave =
        editor.isValid &&
        !codeConflict &&
        !codeGuard &&
        !save.isPending &&
        (editor.isDirty || isNew);

    const submit = useCallback(() => {
        if (!canSave) return;

        save.mutate(
            { portalId, id: saved?.id ?? null, dto: editor.payload },
            {
                onSuccess: created => {
                    // Созданная анкета получает свой адрес: обновление
                    // страницы должно открывать её же, а не пустую форму.
                    // Сверку ей запустит появление `saved` — как при любом
                    // открытии анкеты.
                    if (isNew) {
                        router.replace(
                            `/portal/${portalId}/questionnaires/${created.id}`,
                        );
                        return;
                    }

                    // Состав изменился — прежний разбор устарел. И именно
                    // сейчас подтягивать снова можно: черновик чист.
                    runSilentCheck(created.id);
                },
            },
        );
    }, [
        canSave,
        editor.payload,
        isNew,
        portalId,
        router,
        runSilentCheck,
        save,
        saved?.id,
    ]);

    return {
        isNew,
        schema,
        saved,
        appCodes,
        domain,

        ...editor,
        setTitle,
        setPurpose,
        codeConflict,
        /** Почему сохранение заперто до ответа списка; `null` — код проверен. */
        codeCheckReason: codeGuard ? CODE_GUARD_TEXT[codeGuard] : null,
        /**
         * Список анкет не прочитан вовсе — это владелец должен видеть рядом
         * с кодом, а не гадать по запертой кнопке. Ожидание списка сюда не
         * попадает: оно длится мгновение и мигало бы на каждом создании.
         */
        codeCheckError: codeGuard === 'failed' ? CODE_GUARD_TEXT.failed : null,

        pickerTarget,
        openFieldPicker: setPickerTarget,
        applyPickedFields,

        /** Перечитать поле вопроса из Битрикса и обновить привязку. */
        syncItemField,
        syncingItemIndex,

        runCheck,
        /** Итог последней сверки ПО КНОПКЕ; `null` — её не запускали. */
        checkSummary,
        hideCheckResult,
        isChecking: check.isPending,
        /** Почему кнопка «Проверить привязки» заперта. */
        checkBlockReason,
        /**
         * Одна строка мелким шрифтом: тихая сверка не прошла либо поля
         * читались урезанным способом. `null` — говорить нечего.
         */
        checkNotice,

        /** Что в Битриксе разошлось с анкетой; `null` — панель не рисуем. */
        syncReport,
        /** Почему подтянуть сейчас нельзя; `null` — можно. */
        syncBlockReason,
        applyAllSync,
        applyItemSync,
        /** Отметить строку разбора к подтягиванию или снять отметку. */
        toggleSyncPick,
        hideSyncReport,
        isApplyingSync: applySync.isPending,

        submit,
        canSave,
        isSaving: save.isPending,

        isLoading:
            schemaQuery.isLoading ||
            (!isNew && questionnaireQuery.isLoading) ||
            appsQuery.isLoading,
        isError: schemaQuery.isError || (!isNew && questionnaireQuery.isError),
        isSchemaError: schemaQuery.isError,
    };
};
