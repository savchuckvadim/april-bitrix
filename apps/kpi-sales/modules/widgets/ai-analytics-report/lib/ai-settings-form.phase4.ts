import {
    appendAiHypothesisRow,
    type AiHypothesisFormRow,
} from './ai-settings-form.hypothesis';
import {
    withAiSettingsDirty,
    type AiSettingsFormState,
    type AiSettingsPrefill,
} from './ai-settings-form.util';

/*
 * Правки вкладок «Гипотеза качества» и «Пул порталов»: каждая помечает
 * свой блок изменённым (hypothesis | pool). Оба блока сравнимую историю не
 * рвут — подтверждения перед сохранением не требуют.
 */

/** Состояние вкладок «Гипотеза» и «Пул»: грузится, сервер старый или готово. */
export type AiSettingsPhase4State = 'loading' | 'outdated' | 'ready';

/**
 * Вкладки Фазы 4 можно править, только если сервер прислал гипотезу
 * (поле есть, пусть и null). Старый сервер поля не присылает: пустая
 * вкладка выглядела бы как «гипотезы нет», и сохранение затёрло бы
 * текущую гипотезу портала, а согласие на пул он молча выбросил бы.
 */
export const aiSettingsPhase4State = (
    settings: Pick<AiSettingsPrefill, 'hypothesis'> | null,
): AiSettingsPhase4State => {
    if (settings === null) return 'loading';
    return settings.hypothesis === undefined ? 'outdated' : 'ready';
};

/** Подсказка вкладки, пока править нельзя; готово — null. */
export const AI_SETTINGS_PHASE4_HINT: Record<AiSettingsPhase4State, string | null> =
    {
        loading: 'Загружаем текущие настройки портала…',
        outdated:
            'Эта настройка пока недоступна: сервер аналитики нужно обновить — попросите разработчика.',
        ready: null,
    };

/**
 * Текст согласия на пул: полный состав того, что уходит (PoolPortalInput
 * бэка — нормы и усадка, срок оплаты, чек и разброс, сезон, связь
 * качества, число менеджеров). Согласие даётся на этот список — он не
 * должен быть уже того, что передаётся на деле.
 */
export const AI_SETTINGS_POOL_CONSENT_TEXT =
    'Общая статистика порталов помогает, пока своих данных мало. В неё раз в месяц уходят только обезличенные итоги: нормы переходов воронки и сила их усадки, срок оплаты, обычный чек и его разброс, сезонность, оценка связи качества разговоров с результатом и число менеджеров. Домен портала и имена сотрудников не передаются, записи разговоров и суммы отдельных сделок — тоже. Когда участвуют три и более портала, нормы и срок оплаты уточняются по общей статистике. Сравнимую историю согласие не рвёт.';

export const addAiHypothesisRow = (
    state: AiSettingsFormState,
): AiSettingsFormState =>
    withAiSettingsDirty(
        {
            ...state,
            hypothesis: appendAiHypothesisRow(
                state.hypothesis,
                state.nextHypothesisId,
            ),
            nextHypothesisId: state.nextHypothesisId + 1,
        },
        'hypothesis',
    );

export const patchAiHypothesisRow = (
    state: AiSettingsFormState,
    id: number,
    changes: Partial<Omit<AiHypothesisFormRow, 'id'>>,
): AiSettingsFormState =>
    withAiSettingsDirty(
        {
            ...state,
            hypothesis: state.hypothesis.map(row =>
                row.id === id ? { ...row, ...changes } : row,
            ),
        },
        'hypothesis',
    );

export const removeAiHypothesisRow = (
    state: AiSettingsFormState,
    id: number,
): AiSettingsFormState =>
    withAiSettingsDirty(
        {
            ...state,
            hypothesis: state.hypothesis.filter(row => row.id !== id),
        },
        'hypothesis',
    );

/**
 * Согласие на общую статистику порталов: true — дать, false — отозвать,
 * null — не трогать. Значение, совпадающее с текущим, блок не помечает:
 * сохранять нечего.
 */
export const setAiPool = (
    state: AiSettingsFormState,
    value: boolean | null,
): AiSettingsFormState =>
    value === null || value === state.poolOptIn
        ? {
              ...state,
              pool: null,
              dirty: state.dirty.filter(block => block !== 'pool'),
          }
        : withAiSettingsDirty({ ...state, pool: value }, 'pool');
