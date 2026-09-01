import { METRIC } from '../model/metric-event.type';
import type {
    BootPhaseLabel,
    DeliveryAttemptOutcomeLabel,
    HiddenQuestionReasonLabel,
    OutboxStateLabel,
    QuestionChannelLabel,
    ReportOutcomeLabel,
    SendKindLabel,
} from './metric-contract';
import { metrics, type MetricsClient } from './metrics-client';

/**
 * Врезки бизнес-метрик — ЕДИНСТВЕННОЕ, что зовёт бизнес-код.
 *
 * Зачем прослойка поверх `metrics.collect`: врезка стоит внутри двигателя
 * доставки, внутри резолва анкеты, внутри листенера — в местах, которым
 * незачем знать ни имён метрик, ни формы меток. Здесь имя и метки собраны
 * один раз, а вызывающий пишет `countDeliveryAttempt({ outcome, target })`
 * и не может ошибиться значением: типы меток приходят из контракта.
 *
 * ЖЕЛЕЗНОЕ ПРАВИЛО ВРЕЗКИ. Ни одна функция отсюда не бросает, ничего не
 * ждёт и ничего не возвращает: поведение приложения при выключенных
 * метриках и при недоступном маршруте обязано быть прежним до байта. Всё
 * молчание обеспечено уровнем ниже (`MetricsClient.collect` глотает
 * что угодно и при выключенном сборе не делает вовсе ничего), поэтому здесь
 * нет ни одного try/catch — он был бы имитацией защиты.
 *
 * `client` последним параметром — для тестов самой прослойки; бизнес-код
 * его не передаёт и ходит через общий сборщик приложения.
 */

/** Домен портала как метка: пусто/нет — маршрут честно запишет `unknown`. */
const domainLabel = (domain: string | null | undefined): string => domain ?? '';

/**
 * ПЕРВАЯ ЗАГРУЗКА, одна фаза: сколько прошло от НАВИГАЦИИ документа до этой
 * фазы. Секунды — единица имени метрики (`_seconds`), перевод из миллисекунд
 * делает вызывающий (boot-metrics.ts), потому что там же живёт и сводка.
 */
export const observeBootPhase = (
    params: {
        phase: BootPhaseLabel | string;
        seconds: number;
        domain?: string | null;
    },
    client: MetricsClient = metrics,
): void => {
    client.collect({
        name: METRIC.bootPhase,
        labels: { phase: params.phase, domain: domainLabel(params.domain) },
        value: params.seconds,
    });
};

/** ГЛАВНАЯ ЦИФРА владельца: первая загрузка целиком, до списка дел. */
export const observeBootToTasks = (
    params: { seconds: number; domain?: string | null },
    client: MetricsClient = metrics,
): void => {
    client.collect({
        name: METRIC.bootToTasks,
        labels: { domain: domainLabel(params.domain) },
        value: params.seconds,
    });
};

/**
 * ПОПЫТКА ДОСТАВКИ: одно обращение к одной цели.
 *
 * Это ЧАСТОТА, а не судьба. Одна сессия отправки при молчащем бэке даёт три
 * сетевые попытки плюс фолбэк-пас, а дренаж повторяет то же самое каждую
 * минуту — счётчик обязан от этого расти, потому что «сколько раз мы стучимся
 * впустую» и есть его вопрос. Долю доставленных по нему считать НЕЛЬЗЯ: за
 * терминальный исход конверта отвечает `countReportOutcome`.
 *
 * `target` типизирован строкой намеренно: id целей живёт в реестре
 * delivery-targets и пополняется зеркалами, а белый список значений метки —
 * в контракте. Незнакомая цель схлопнется в `other` и серий не размножит.
 */
export const countDeliveryAttempt = (
    params: {
        outcome: DeliveryAttemptOutcomeLabel;
        target: string;
        domain?: string | null;
    },
    client: MetricsClient = metrics,
): void => {
    client.collect({
        name: METRIC.deliveryAttempt,
        labels: {
            outcome: params.outcome,
            target: params.target,
            domain: domainLabel(params.domain),
        },
    });
};

/**
 * СУДЬБА ОТЧЁТА — терминальный исход конверта, РОВНО ОДИН за его жизнь.
 *
 * Однократность обеспечивается не здесь, а отметкой в самом конверте
 * (`markReportOutcome` в слайсе event-outbox): отметка лежит в IndexedDB,
 * поэтому её видят и повторный вызов, и соседняя вкладка, и следующая
 * сессия. Здесь — только сборка метки.
 */
export const countReportOutcome = (
    params: { outcome: ReportOutcomeLabel; domain?: string | null },
    client: MetricsClient = metrics,
): void => {
    client.collect({
        name: METRIC.reportOutcome,
        labels: {
            outcome: params.outcome,
            domain: domainLabel(params.domain),
        },
    });
};

/**
 * ОСТАТОК КОНВЕРТОВ — УРОВЕНЬ, а не событие: публикуются все три состояния
 * разом, включая нули. Ноль обязателен: без него gauge навсегда застыл бы на
 * последнем ненулевом значении, и разъехавшаяся очередь выглядела бы на
 * графике вечно застрявшей.
 *
 * Честная оговорка живёт в help метрики: значение публикует КАЖДАЯ вкладка по
 * итогу своего прогона, и в серии остаётся замер последней написавшей. Это
 * индикатор «где-то лежит столько-то», а не итог по порталу.
 */
export const publishOutboxLevel = (
    params: {
        domain?: string | null;
        undelivered: number;
        partial: number;
        incomplete: number;
    },
    client: MetricsClient = metrics,
): void => {
    const domain = domainLabel(params.domain);
    const levels: Array<[OutboxStateLabel, number]> = [
        ['undelivered', params.undelivered],
        ['partial', params.partial],
        ['incomplete', params.incomplete],
    ];
    for (const [state, value] of levels) {
        client.collect({
            name: METRIC.outboxBacklog,
            labels: { state, domain },
            value,
        });
    }
};

/**
 * СПРЯТАННЫЙ ВОПРОС анкеты: менеджеру его не показали, и вот почему.
 *
 * Самая ценная метрика захода: до неё «включил настройку, а вопросов нет»
 * был молчаливым отказом, который стоил владельцу часа поисков.
 */
export const countHiddenChecklistQuestion = (
    params: {
        reason: HiddenQuestionReasonLabel;
        channel: QuestionChannelLabel;
        domain?: string | null;
    },
    client: MetricsClient = metrics,
): void => {
    client.collect({
        name: METRIC.checklistQuestionHidden,
        labels: {
            reason: params.reason,
            channel: params.channel,
            domain: domainLabel(params.domain),
        },
    });
};

/** ОТПРАВКИ ВСЕГО: момент, когда отправка отчёта или недозвона началась. */
export const countSend = (
    params: { kind: SendKindLabel; domain?: string | null },
    client: MetricsClient = metrics,
): void => {
    client.collect({
        name: METRIC.send,
        labels: { kind: params.kind, domain: domainLabel(params.domain) },
    });
};
