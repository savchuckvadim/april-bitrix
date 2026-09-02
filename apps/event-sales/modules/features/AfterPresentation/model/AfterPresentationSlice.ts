import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    composeSurveyBlockValue,
    EMPTY_SURVEY_BLOCK,
    type SurveyBlockDraft,
} from '../lib/check-presentation.blocks';
import {
    CheckPresentationItem,
    CheckPresentationValue,
} from '../type/check-presentation-type';

export type AfterPresentationState = typeof initialState;

export const initialState = {
    checkPresentation: {
        items: [] as CheckPresentationItem[],
        /** рабочая копия ответов (редактируется в форме), ключ — id поля */
        answers: {} as Record<string, CheckPresentationValue>,
        /** последний сохранённый снимок ответов (baseline для отмены) */
        committed: {} as Record<string, CheckPresentationValue>,
        /**
         * Черновики блоков с подвопросами (02.09): собственный текст,
         * ответы по подвопросам, развёрнут ли блок. Значение поля CRM из
         * черновика собирается в `answers` при каждой правке — всё, что
         * читает ответы (persist, payload, сводка), видит одну строку.
         */
        blocks: {} as Record<string, SurveyBlockDraft>,
        /** снимок черновиков блоков — откатывается вместе с committed */
        committedBlocks: {} as Record<string, SurveyBlockDraft>,
    },
    isActive: false as boolean,
    initialized: false as boolean,
    /** хвост подтверждён пользователем — готов к отправке */
    isConfirmed: false as boolean,
    /** модалка открыта как обязательный шаг перед отправкой события */
    pendingSend: false as boolean,
    /**
     * Что случилось с записью ответов в поля клиента: полный провал (окно
     * остаётся открытым, подтверждения нет) или частичный — часть сущностей
     * не приняла ответы, отправка продолжается с предупреждением. Раньше
     * такие ошибки уходили в console.error, и менеджер был уверен, что
     * ответы сохранены.
     */
    persistError: null as string | null,
};

/** Правка ответов снимает подтверждение — см. setAnswer. */
const touch = (state: AfterPresentationState): void => {
    state.isConfirmed = false;
    state.persistError = null;
};

/** Пересобрать значение блока после правки черновика. */
const recomposeBlock = (state: AfterPresentationState, id: string): void => {
    const item = state.checkPresentation.items.find(entry => entry.id === id);
    const draft = state.checkPresentation.blocks[id] ?? EMPTY_SURVEY_BLOCK;
    state.checkPresentation.answers[id] = composeSurveyBlockValue(
        item?.questions ?? [],
        draft,
    );
    touch(state);
};

const afterPresentationSlice = createSlice({
    name: 'afterPresentation',
    initialState,
    reducers: {
        setInitialized: (
            state: AfterPresentationState,
            action: PayloadAction<{ items: CheckPresentationItem[] }>,
        ) => {
            state.checkPresentation.items = action.payload.items;
            state.initialized = true;
        },
        setAnswer: (
            state: AfterPresentationState,
            action: PayloadAction<{
                id: string;
                value: CheckPresentationValue;
            }>,
        ) => {
            state.checkPresentation.answers[action.payload.id] =
                action.payload.value;
            /*
             * Правка ответов снимает подтверждение. Иначе получался обмен
             * втёмную: подтвердил → открыл окно → поправил → «Отмена»
             * (answers откатываются к committed) → отправка идёт со СТАРЫМ
             * снимком, хотя менеджер видел новый. Теперь после правки
             * опросник снова обязателен и уедет ровно то, что подтверждено.
             */
            touch(state);
        },
        /** Собственный текст блока (свёрнутый режим или общий ответ). */
        setBlockText: (
            state: AfterPresentationState,
            action: PayloadAction<{ id: string; text: string }>,
        ) => {
            const current =
                state.checkPresentation.blocks[action.payload.id] ??
                EMPTY_SURVEY_BLOCK;
            state.checkPresentation.blocks[action.payload.id] = {
                ...current,
                text: action.payload.text,
            };
            recomposeBlock(state, action.payload.id);
        },
        /** Ответ на подвопрос блока по его индексу. */
        setBlockSub: (
            state: AfterPresentationState,
            action: PayloadAction<{ id: string; index: number; text: string }>,
        ) => {
            const current =
                state.checkPresentation.blocks[action.payload.id] ??
                EMPTY_SURVEY_BLOCK;
            state.checkPresentation.blocks[action.payload.id] = {
                ...current,
                sub: { ...current.sub, [action.payload.index]: action.payload.text },
            };
            recomposeBlock(state, action.payload.id);
        },
        /** «Развернуть подробно» / свернуть — вид, значение не меняется. */
        setBlockExpanded: (
            state: AfterPresentationState,
            action: PayloadAction<{ id: string; expanded: boolean }>,
        ) => {
            const current =
                state.checkPresentation.blocks[action.payload.id] ??
                EMPTY_SURVEY_BLOCK;
            state.checkPresentation.blocks[action.payload.id] = {
                ...current,
                expanded: action.payload.expanded,
            };
        },
        /**
         * Ответ, записанный на портал МИМО опросника (ручная правка
         * хвост-поля в «Полях сущности»). Пишем и в answers, и в committed:
         * повторный submit опросника персистит committed целиком, и без
         * синхронизации он откатывал бы ручную правку прошлым ответом.
         */
        syncAnswer: (
            state: AfterPresentationState,
            action: PayloadAction<{
                id: string;
                value: CheckPresentationValue;
            }>,
        ) => {
            state.checkPresentation.answers[action.payload.id] =
                action.payload.value;
            state.checkPresentation.committed[action.payload.id] =
                action.payload.value;
        },
        setActiveStatus: (
            state: AfterPresentationState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.isActive = action.payload.status;
        },
        /** зафиксировать текущие ответы как сохранённые (при успешном submit) */
        commitAnswers: (state: AfterPresentationState) => {
            state.checkPresentation.committed = {
                ...state.checkPresentation.answers,
            };
            state.checkPresentation.committedBlocks = {
                ...state.checkPresentation.blocks,
            };
        },
        /** откатить рабочие ответы к последнему сохранённому снимку (при отмене) */
        revertAnswers: (state: AfterPresentationState) => {
            state.checkPresentation.answers = {
                ...state.checkPresentation.committed,
            };
            state.checkPresentation.blocks = {
                ...state.checkPresentation.committedBlocks,
            };
        },
        setConfirmed: (
            state: AfterPresentationState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.isConfirmed = action.payload.status;
        },
        setPendingSend: (
            state: AfterPresentationState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.pendingSend = action.payload.status;
        },
        /** Итог записи ответов на портал: null — записались все цели. */
        setPersistError: (
            state: AfterPresentationState,
            action: PayloadAction<{ message: string | null }>,
        ) => {
            state.persistError = action.payload.message;
        },
        /** сброс перед новым событием (items/initialized сохраняем — грузятся раз на портал) */
        resetForNewEvent: (state: AfterPresentationState) => {
            state.checkPresentation.answers = {};
            state.checkPresentation.committed = {};
            state.checkPresentation.blocks = {};
            state.checkPresentation.committedBlocks = {};
            state.isConfirmed = false;
            state.pendingSend = false;
            state.isActive = false;
            state.persistError = null;
        },
        /**
         * Полный сброс (reloadApp): в отличие от resetForNewEvent гасит и
         * initialized — initCheckPresentation на свежем setPortal перечитает
         * каталог опросника, а не отсечётся флагом прошлой сессии.
         */
        reset: () => initialState,
    },
});

export const afterPresentationReducer = afterPresentationSlice.reducer;
export const afterPresentationActions = afterPresentationSlice.actions;
