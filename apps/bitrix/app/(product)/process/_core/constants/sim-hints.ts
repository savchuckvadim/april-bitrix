import type { ProcessModel, StageView } from '../types';
import type { SimState, SimTask } from '../lib/simulator.util';

/** Куда переезжает карточка-гид. Каждому значению соответствует свой слот. */
export type SimAnchor =
    | 'gate'
    | 'tasks'
    | 'form'
    | 'workplace'
    | 'funnels'
    | 'log'
    | 'summary'
    | 'status';

export interface SimHintContext {
    state: SimState;
    model: ProcessModel;
    stageView: StageView | undefined;
    activeTask: SimTask | null;
    isAdminGate: boolean;
    isOverlap: boolean;
    isFinished: boolean;
}

export interface SimHint {
    /** Ключ «показано»: подсказка не возвращается сама после закрытия. */
    id: string;
    anchor: SimAnchor;
    title: string;
    when: (ctx: SimHintContext) => boolean;
    text: (ctx: SimHintContext) => string;
}

/**
 * Был ли уже хотя бы один ОТЧЁТ.
 *
 * Считать по длине лога нельзя: разбор входа тоже пишет туда запись, и
 * подсказка «вы заполнили форму» вылезала бы до того, как форму открыли.
 */
const hasReported = (ctx: SimHintContext): boolean =>
    ctx.state.log.some(entry => entry.action.startsWith('Отчитался'));

/** Разбирает ли вход человек — от этого меняются первые две подсказки. */
const hasHumanGate = (ctx: SimHintContext): boolean =>
    ctx.model.stages[0]?.actor === 'adm' ||
    ctx.model.stages[0]?.actor === 'rop';

/**
 * Подсказки симулятора.
 *
 * Правило отбора: подсказка имеет право на существование, только если несёт
 * мысль, которой на экране НЕТ. Всё, что система уже сделала, подробно
 * рассказано в ленте постфактум — здесь объясняется обратное: почему вы видите
 * этот экран, откуда взялось то, что на нём, и чего от вас ждут.
 *
 * Порядок в массиве — порядок приоритета: показывается первая подходящая из
 * ещё не показанных.
 */
export const SIM_HINTS: SimHint[] = [
    {
        id: 'manager-morning',
        anchor: 'tasks',
        title: 'Вы пришли на работу',
        when: ctx =>
            ctx.state.isManagerMode &&
            !ctx.activeTask &&
            ctx.state.log.length === 0,
        text: ctx =>
            hasHumanGate(ctx)
                ? 'Вот дела на сегодня. Их поставила автоматика, администратор или вы сами вчера. Всё, что было до этого — разбор входа, проверка дублей, поиск компании, — менеджер не видит вовсе.'
                : 'Вот дела на сегодня. Разбирать вход в этой схеме некому: лид попадает к вам как есть, и выяснять, что за компания, придётся самому.',
    },
    {
        id: 'admin-gate',
        anchor: 'gate',
        title: 'Сделки ещё нет',
        when: ctx => ctx.isAdminGate && ctx.state.log.length === 0,
        text: () =>
            'Ни одной. Она появится, когда вы передадите клиента: сделку, воронку холодного обзвона и первую задачу заводит один хук — разом, без единого действия менеджера.',
    },
    {
        id: 'after-handover',
        anchor: 'funnels',
        title: 'Хук отработал',
        when: ctx =>
            ctx.state.isHandedOver &&
            !ctx.state.isManagerMode &&
            ctx.state.log.length === 1,
        text: () =>
            'Одним пакетом появилось всё сразу: сделка в основной воронке, спутник холодного обзвона и задача с дедлайном. Менеджер не создавал ничего — он получил готовое.',
    },
    {
        id: 'first-form',
        anchor: 'form',
        title: 'Одна форма вместо десяти полей',
        when: ctx => Boolean(ctx.activeTask),
        text: () =>
            'Слева — отчёт о том, что уже было. Справа — план следующего шага. План двигает сделку по лестнице так же, как отчёт: достаточно назначить презентацию, и сделка уже на «Презентации».',
    },
    {
        id: 'overlap-choice',
        anchor: 'workplace',
        title: 'Здесь решаете вы',
        when: ctx => ctx.isOverlap && !ctx.isFinished,
        text: () =>
            'Стадию держат обе сущности сразу, и менеджер сам выбирает, откуда работать. Форма одна и та же — разница в том, что видно вокруг: из сделки все заявки компании, из лида только текущая.',
    },
    {
        id: 'system-did',
        anchor: 'log',
        title: 'Это сделала система',
        when: ctx => hasReported(ctx) && !ctx.activeTask,
        text: () =>
            'Вы заполнили одну форму — остальное произошло само. Каждая строка здесь соответствует реальному действию в портале: стадии, задачи, записи для отчётов, поля карточки.',
    },
    {
        id: 'company-unknown',
        anchor: 'status',
        title: 'Тот самый десятый случай',
        when: ctx => ctx.state.companyKnown === false,
        text: () =>
            'Компанию на входе определить не удалось, и сделка завелась без неё. По регламенту добавить нужно как можно раньше: пока компании нет, привязывать к ней историю обращений не к чему.',
    },
    {
        id: 'final-summary',
        anchor: 'summary',
        title: 'Ради этого и ведут отчётность',
        when: ctx => ctx.isFinished,
        text: () =>
            'Видно не «продал или нет», а сколько попыток стоила продажа и на каком шаге терялось. Именно так руководитель и смотрит на работу менеджера.',
    },
];
