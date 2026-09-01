import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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

const afterPresentationSlice = createSlice({
    name: 'afterPresentation',
    initialState,
    reducers: {
        setInitialized: (
            state: AfterPresentationState,
            action: PayloadAction<{ items: CheckPresentationItem[] }>,
        ) => {
            state.checkPresentation.items = action.payload.items;
            // Шаблон — стартовое ЗНАЧЕНИЕ поля, а не подсказка: менеджер
            // открывает опросник и сразу видит пронумерованные вопросы,
            // между которыми пишет ответы. Посев идёт и в committed, иначе
            // «отмена» вычистила бы вопросы из поля.
            //
            // Уже введённый ответ шаблоном не затирается: инициализация
            // случается раз на портал, но перестраховка здесь дешевле
            // потерянного ответа.
            for (const item of action.payload.items) {
                if (!item.template) continue;
                if (state.checkPresentation.answers[item.id] !== undefined) {
                    continue;
                }
                state.checkPresentation.answers[item.id] = item.template;
                state.checkPresentation.committed[item.id] = item.template;
            }
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
            state.isConfirmed = false;
            state.persistError = null;
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
        },
        /** откатить рабочие ответы к последнему сохранённому снимку (при отмене) */
        revertAnswers: (state: AfterPresentationState) => {
            state.checkPresentation.answers = {
                ...state.checkPresentation.committed,
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
