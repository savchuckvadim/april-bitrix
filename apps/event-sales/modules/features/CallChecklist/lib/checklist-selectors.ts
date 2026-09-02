import type { RootState } from '@/modules/app/model/store';
import { isDomainConfigKey } from '@/modules/app/consts/domain-config';
import { EV_PLAN_PROP } from '@/modules/entities/EventPlan/type/event-plan-type';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
// Прямой путь, а не барель слайса: барель тянет редьюсер презентаций.
import { isPresentationDone } from '@/modules/entities/EventPresentation/lib/presentation-done';
// Прямые пути, а не барель слайса каталога: барель тянет транспорт.
import type { QuestionnaireCondition } from '@/modules/entities/Questionnaire/model/questionnaire.type';
import { selectQuestionnaireDefs } from '@/modules/entities/Questionnaire/model/selectors';
import {
    isQuestionnaireDisabledByEventTypes,
    parseQuestionnaireDisabledEventTypes,
} from '@/modules/entities/Questionnaire/lib/questionnaire-disabled';
import type {
    ChecklistDef,
    ChecklistFieldDef,
} from '../type/call-checklist.type';
import {
    checklistFieldRefs,
    resolveChecklistField,
    type ChecklistEntityRows,
    type ResolvedChecklistField,
} from './checklist-values';

/**
 * Активность анкет и незакрытые обязательные вопросы — чистые функции над
 * RootState: их зовут и UI (карточка в плане), и send-validation.
 *
 * Состав анкет читается из стора (`selectQuestionnaireDefs`), а не из
 * константы: каталог задаёт портал. Пустым он не бывает — до ответа и после
 * любого провала там стоит встроенный набор, поэтому ни один сбой загрузки
 * каталога не может ни отменить вопросы, ни заблокировать отправку.
 */

/**
 * Носители полей анкеты. Единственное место, где решается, откуда берётся
 * строка сделки — из стора или из лениво догруженной базовой (встройка-
 * компания): у инлайн-хука раньше была своя копия БЕЗ этого фолбэка, и
 * карточка не показывала чек-лист, который окно предпроверки требовало
 * заполнить (дедлок).
 */
export const selectChecklistRows = (state: RootState): ChecklistEntityRows => ({
    company: state.app.bitrix.company as unknown as Record<
        string,
        unknown
    > | null,
    // Встройка-компания: сделки в сторе нет — текущие значения берутся из
    // строки базовой сделки, лениво догруженной по predict.baseDealId.
    deal:
        (state.app.bitrix.deal as unknown as Record<string, unknown> | null) ??
        state.callChecklist.baseDeal.row,
    lead: state.app.bitrix.lead as unknown as Record<string, unknown> | null,
});

/**
 * Одно условие показа: значения внутри — ИЛИ (семантика бэка, повторяется
 * один в один).
 *
 * Значений не принимают два вида: `always` (анкета показывается всегда,
 * когда включена настройкой портала) и `presentationDone` (факт «презентацию
 * провели» — один, уточнять в нём нечего).
 */
const isConditionActive = (
    condition: QuestionnaireCondition,
    state: RootState,
): boolean => {
    const values = condition.values;
    switch (condition.kind) {
        case 'always':
            return true;
        case 'planType': {
            const plan = state.eventPlan;
            const code = plan[EV_PLAN_PROP.TYPE].current?.code;
            return (
                plan[EV_PLAN_PROP.IS_ACTIVE] &&
                Boolean(code) &&
                values.includes(String(code))
            );
        }
        case 'reportType': {
            const type = state.eventTask.current?.eventType;
            return Boolean(type) && values.includes(String(type));
        }
        case 'workStatus': {
            const code =
                state.eventReport.report[EV_REPORT_PROP.WORK_STATUS].current
                    ?.code;
            return Boolean(code) && values.includes(String(code));
        }
        case 'presentationDone': {
            // «Презентация проведена» — включая СПОНТАННУЮ, отмеченную на
            // непрезентационном событии. Без этого условия анкету
            // спонтанной презентации показать было бы нечем: `reportType`
            // читает ТИП ЗАДАЧИ, а он в этом случае обычный звонок — при
            // том, что бэк элемент презентации всё равно создаёт, и ответы
            // ему нужны. Значений условие не принимает: факт один.
            return isPresentationDone(state.eventPresentation);
        }
        case 'targetStage': {
            // Отправка двинет основную сделку на эту стадию — знает только
            // предикт (лестница живёт на бэке). Нет предикта — анкета молчит.
            const predict = state.stagePredict.result;
            if (!predict?.targetStageCode) return false;
            if (!values.includes(String(predict.targetStageCode))) return false;
            // Условие про ПЕРЕХОД, а не про «сделка стоит на этой стадии».
            // Лестница бэка не умеет понижать: у сделки, которая уже на
            // «Клиент на решении», целевой стадией возвращается она же — и
            // без этой проверки модалка вставала перед КАЖДОЙ отправкой по
            // такой сделке, даже когда планируют доработку и сделка никуда
            // не едет. `willChange` бэк считает сам (target !== current),
            // фронт его до 02.09 просто не читал.
            return predict.willChange;
        }
        default:
            // Вид условия, которого движок не знает: анкету НЕ показываем.
            // Реестр бэка расширяется раньше фрейма, и «показать анкету,
            // условие которой мы не проверили» — это вопросы не вовремя, а
            // при обязательном пункте ещё и заблокированная отправка.
            return false;
    }
};

/**
 * Включена настройкой портала. `configKey` пустой — анкета включена всегда
 * (портальному каталогу фича-флаг не нужен: анкету создали — значит хотят).
 *
 * Ключ, которого нет в реестре настроек фрейма, — тоже «включена». Портал
 * вписывает `configKey` руками, реестра допустимых ключей у него нет, и
 * незнакомая строка (опечатка или серверная настройка, которой фрейм не
 * знает) раньше означала «false» — анкета не показывалась НИКОГДА и молча.
 * Неизвестный флаг проверить нечем, а признак желания портала здесь другой:
 * анкету завели и включили. Момент показа всё равно решают условия, а сам
 * неизвестный ключ виден предупреждением нормализатора каталога.
 */
const isConfigEnabled = (def: ChecklistDef, state: RootState): boolean => {
    if (!def.configKey) return true;
    if (!isDomainConfigKey(def.configKey)) return true;
    return Boolean(state.app.config[def.configKey]);
};

/**
 * Анкеты, активные сейчас: рубильник по типам события + настройка портала +
 * ВСЕ условия сразу (между условиями И). Анкета без условий не показывается —
 * пустой список условий приходит только от сломанных данных, а «показывать
 * всегда» — это явный вид `always`.
 *
 * Рубильник (`questionnaires_disabled_event_types`) стоит ПЕРВЫМ и один на
 * весь состав — и на портальные анкеты, и на встроенные наборы: для
 * менеджера это одни и те же анкеты, а встроенный набор и существует как
 * замена портального каталога. Считать его обязан именно фрейм: бэк
 * ответы погашенной анкеты выбрасывает молча, и без этой проверки менеджер
 * отвечал бы в пустоту, обязательный вопрос запирал бы отправку, а ответы
 * канала `crm` уезжали бы прямо в компанию/сделку/лид.
 */
export const selectActiveChecklists = (state: RootState): ChecklistDef[] => {
    const disabledEventTypes = parseQuestionnaireDisabledEventTypes(
        state.app.config.questionnairesDisabledEventTypes,
    );

    return selectQuestionnaireDefs(state).filter(
        def =>
            !isQuestionnaireDisabledByEventTypes(
                def.conditions,
                disabledEventTypes,
            ) &&
            isConfigEnabled(def, state) &&
            def.conditions.length > 0 &&
            def.conditions.every(condition =>
                isConditionActive(condition, state),
            ),
    );
};

/**
 * Инлайн-блоки конкретной колонки — по данным каталога, а не по месту
 * вставки компонента: одна и та же карточка стоит в обеих колонках и
 * спрашивает то, что каталог для этой колонки назначил.
 *
 * `place` не задан — колонка берётся из НАЗНАЧЕНИЯ анкеты (`purpose`):
 * анкета планирования живёт в колонке плана, анкета отчётности — в колонке
 * отчёта. Портал заводит место явно; необязательным оно оставлено ради
 * анкет, у которых назначение и место совпадают.
 */
export const selectInlineChecklistsAt = (
    state: RootState,
    place: 'plan' | 'report',
): ChecklistDef[] =>
    selectActiveChecklists(state).filter(
        def =>
            def.presentation === 'inline' &&
            (def.place ?? def.purpose) === place,
    );

/**
 * ВСЕ инлайн-блоки обеих колонок — для валидации отправки: обязательный
 * вопрос обязан блокировать отправку независимо от того, в какой колонке
 * его задают.
 */
export const selectInlineChecklists = (state: RootState): ChecklistDef[] =>
    selectActiveChecklists(state).filter(def => def.presentation === 'inline');

/** Резолв вопросов анкеты: неадресуемые на портале выпадают. */
export const resolveChecklistFields = (
    state: RootState,
    def: ChecklistDef,
): ResolvedChecklistField[] =>
    checklistFieldRefs(def)
        .map(ref =>
            resolveChecklistField(
                ref,
                state.portal.portal,
                selectChecklistRows(state),
            ),
        )
        .filter((f): f is ResolvedChecklistField => f !== null);

/**
 * «Обязательность изменения»: пункт закрывается ТОЛЬКО ответом, данным в
 * этой сессии, — значение, уже стоящее в CRM, его не закрывает.
 *
 * Смысл требования владельца: есть вопросы, на которые ответ обязан быть
 * СВЕЖИМ («что клиент ответил сейчас»), и прошлогодняя запись в поле — это
 * не ответ на сегодняшний звонок. Срок годности (`staleAfterDays`) решает то
 * же самое, но только для дат: у справочника и строки возраст значения
 * узнать неоткуда.
 *
 * Только канал `crm`: у `dto`/`text` прежнего значения не существует вовсе,
 * и требование «измени» там ничем не отличается от обычной обязательности.
 * Бэк выставляет флаг так же (см. нормализатор каталога).
 */
export const isChecklistRequireChange = (def: ChecklistFieldDef): boolean =>
    def.requireChange && def.channel === 'crm';

/**
 * Обязательный вопрос не закрыт: нет ни сохранённого менеджером ответа, ни
 * ГОДНОГО текущего значения в CRM. Единственное определение «не заполнено» —
 * его зовут и валидация отправки, и карточка (подсветка поля).
 *
 * `baselineValue` — снимок значения на момент открытия карточки
 * (`callChecklist.baselineByKey`): нужен только пунктам с «обязательностью
 * изменения», чтобы записанное «то же самое, что было» не считалось
 * ответом. Снимка нет (карточка ещё не открывалась) — сравниваем с текущим
 * значением: строже, чем нужно, но безопасно.
 */
export const isChecklistFieldMissing = (
    resolved: ResolvedChecklistField,
    savedValue: string | undefined,
    baselineValue: string | undefined,
): boolean => {
    if (!resolved.def.isRequired) return false;
    if (isChecklistRequireChange(resolved.def)) {
        if (!savedValue) return true;
        return savedValue === (baselineValue ?? resolved.currentValue);
    }
    // Ответ этой сессии есть — но он бывает ПУСТЫМ: ластик стирает значение
    // и в портале, и в ответах. Строки сущностей при этом не перечитываются,
    // и `currentValue` ниже остался бы прежним — стёртое обязательное поле
    // выглядело бы закрытым, а отчёт уехал бы с пустым полем.
    if (savedValue !== undefined) return savedValue === '';
    if (!resolved.currentValue) return true;
    return isChecklistValueStale(resolved);
};

/**
 * Значение из CRM просрочено: смысл требования — «счёт выставлен ПЕРЕД
 * этим звонком», а не «когда-нибудь». Без срока годности счёт годичной
 * давности закрывал чек-лист оплаты, и звонок планировался без реального
 * счёта.
 *
 * Работает только для дат: там значение само себе отметка времени. У
 * справочников и строк узнать возраст ответа неоткуда — они не стареют.
 */
const isChecklistValueStale = (resolved: ResolvedChecklistField): boolean => {
    const days = resolved.def.staleAfterDays;
    if (!days) return false;
    if (
        resolved.def.control !== 'date' &&
        resolved.def.control !== 'datetime'
    ) {
        return false;
    }
    const filledAt = parseChecklistDate(resolved.currentValue);
    if (!filledAt) return false;
    const ageDays = (Date.now() - filledAt) / MS_IN_DAY;
    return ageDays > days;
};

const MS_IN_DAY = 24 * 60 * 60 * 1000;

/**
 * Дата значения контрола (`YYYY-MM-DD[THH:mm]`) в миллисекунды. Разбор
 * лексический: значение — настенная дата портала, и прогон через
 * часовой пояс браузера сдвигал бы полуночные даты на сутки.
 */
const parseChecklistDate = (value: string): number | null => {
    const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(
        value,
    );
    if (!match) return null;
    const [, year, month, day, hours = '0', minutes = '0'] = match;
    return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hours),
        Number(minutes),
    ).getTime();
};

/**
 * Незакрытые обязательные вопросы анкеты. Вопрос, который некуда записать,
 * отправку не блокирует.
 */
export const getChecklistMissing = (
    state: RootState,
    def: ChecklistDef,
): ChecklistFieldDef[] =>
    resolveChecklistFields(state, def)
        .filter(resolved =>
            isChecklistFieldMissing(
                resolved,
                // Ключ ответа — «анкета:вопрос»: ответ на возражение в плане
                // не закрывает тот же вопрос в отчёте, хотя поле одно.
                state.callChecklist.valueByKey[resolved.answerKey],
                state.callChecklist.baselineByKey[resolved.answerKey],
            ),
        )
        .map(resolved => resolved.def);

/** Инлайн-анкеты с незакрытыми вопросами — для send-validation/preflight. */
export const selectIncompleteInlineChecklists = (
    state: RootState,
): ChecklistDef[] =>
    selectInlineChecklists(state).filter(
        def => getChecklistMissing(state, def).length > 0,
    );

export const selectModalChecklists = (state: RootState): ChecklistDef[] =>
    selectActiveChecklists(state).filter(def => def.presentation === 'modal');

/**
 * Следующая модальная анкета для цепочки send(): активная, с резолвящимися
 * вопросами и либо не подтверждённая, либо с незакрытыми обязательными.
 * Подтверждённые пропускаются (идемпотентный re-entry) — поэтому «модалки
 * одна за другой» получаются сами: confirm → send() → открылась следующая.
 */
export const selectNextPendingChecklist = (
    state: RootState,
): ChecklistDef | null =>
    selectModalChecklists(state).find(
        def =>
            resolveChecklistFields(state, def).length > 0 &&
            (!state.callChecklist.confirmed[def.code] ||
                getChecklistMissing(state, def).length > 0),
    ) ?? null;
