import {
    formatSettingList,
    parseSettingList,
} from '@/modules/entities/portal/app-settings';
import type {
    PortalAppCode,
    PortalAppSettingsBlock,
} from '@/modules/entities/portal/app-settings';
import type { PortalQuestionnaireCondition } from '../model';
import { QUESTIONNAIRE_CODE } from '../model';
import { QUESTIONNAIRE_EVENT_TYPE_KINDS } from './event-smart-registry';

/**
 * Выключатель анкет по типам события.
 *
 * Значение живёт ТОЛЬКО в настройках приложения портала — ключ
 * `questionnaires_disabled_event_types`, CSV кодов типов события. Своего
 * хранилища у раздела анкет нет и быть не должно: одно и то же значение
 * читают фрейм (чтобы не показывать анкету), бэк отчёта (чтобы не уводить
 * ответ в элемент смарта) и эта матрица.
 *
 * Оригинал правила:
 * back/libs/portal-lib/store/questionnaires/portal-questionnaires.schema.ts
 * (`parseQuestionnaireDisabledEventTypes`,
 * `isQuestionnaireDisabledByEventTypes`); фреймовое зеркало —
 * apps/event-sales/modules/entities/Questionnaire/lib/questionnaire-disabled.ts.
 */

/** Ключ настройки: тот же код, что в реестре настроек бэка. */
export const QUESTIONNAIRE_EVENT_SWITCH_CODE =
    'questionnaires_disabled_event_types';

/** Где лежит выключатель и что в нём сейчас записано. */
export interface QuestionnaireEventSwitch {
    /** Приложение, в настройках которого живёт ключ. */
    appCode: PortalAppCode;
    /** Ключ настройки — им же значение и сохраняется. */
    code: string;
    /** Коды типов события, для которых анкеты выключены. */
    disabled: string[];
}

/**
 * Значение настройки → коды выключенных типов события.
 *
 * Формат значения-списка общий для всех настроек и живёт в их слайсе;
 * здесь у него доменное имя, потому что читается он ровно ради этого
 * выключателя. Коды по реестру НЕ сверяются: незнакомый код совпадёт разве
 * что с таким же незнакомым значением условия, а мусор отсеет бэк при
 * чтении.
 */
export const parseDisabledEventTypes = (raw: unknown): string[] =>
    parseSettingList(raw);

/**
 * Выключатель среди настроек портала; `null` — бэк такого ключа не отдал.
 *
 * Ищем ключ по всем приложениям, а не в заранее известном: какому
 * приложению принадлежит настройка, решает реестр бэка, и второй копией
 * этого решения здесь была бы ровно та развилка, из-за которой значение
 * потом сохранилось бы не туда.
 */
export const findQuestionnaireEventSwitch = (
    apps: PortalAppSettingsBlock[] | undefined,
): QuestionnaireEventSwitch | null => {
    for (const block of apps ?? []) {
        const descriptor = block.settings.find(
            setting => setting.code === QUESTIONNAIRE_EVENT_SWITCH_CODE,
        );
        if (!descriptor) continue;

        return {
            appCode: block.appCode,
            code: descriptor.code,
            disabled: parseDisabledEventTypes(descriptor.value),
        };
    }
    return null;
};

/** Включить или выключить один тип события в списке. */
export const toggleDisabledEventType = (
    disabled: readonly string[],
    eventType: string,
    isDisabled: boolean,
): string[] => {
    const next = disabled.filter(code => code !== eventType);
    return isDisabled ? [...next, eventType] : next;
};

/**
 * Список кодов → значение настройки; `null` — сбросить ключ на дефолт.
 *
 * Пустой список уезжает именно сбросом: выключатель, который никого не
 * гасит, настройкой портала быть не должен.
 */
export const formatDisabledEventTypes = (
    disabled: readonly string[],
): string | null => formatSettingList(disabled);

/**
 * Погашена ли анкета выключателем целиком.
 *
 * Правило следует из И-семантики условий: анкета молчит, если хотя бы
 * одно её условие по типу события состоит ЦЕЛИКОМ из выключенных типов —
 * пройти его больше нечем. Анкета с условием «Презентация» ИЛИ «Решение»
 * при выключенной презентации продолжает работать: её всё ещё пускает
 * Решение, и на презентации она тоже покажется. Анкета без условий по
 * типу события выключателем не трогается вовсе.
 */
export const isQuestionnaireSilencedByEventTypes = (
    conditions: PortalQuestionnaireCondition[] | undefined,
    disabled: readonly string[],
): boolean => {
    if (disabled.length === 0) return false;
    const off = new Set(disabled);

    for (const condition of conditions ?? []) {
        if (
            condition.kind === QUESTIONNAIRE_CODE.conditionKind.presentationDone
        ) {
            // Спонтанная презентация: тип задачи обычный звонок, а элемент
            // создаётся презентационный — гасит его код `presentation`.
            if (off.has('presentation')) return true;
            continue;
        }
        if (!QUESTIONNAIRE_EVENT_TYPE_KINDS.includes(condition.kind)) continue;

        const values = condition.values ?? [];
        // Пустой список значений — не «все типы», а сломанное условие.
        if (values.length === 0) continue;
        if (values.every(value => off.has(value))) return true;
    }
    return false;
};
