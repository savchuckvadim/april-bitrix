import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import type { BXTask } from '@workspace/bx';
import {
    EV_TYPE,
    EventTask,
    EventTaskEventType,
} from '../types/event-task-type';
import { getTaskEventComment } from './event-comment';

export const getEvTasksFromBxTasks = (
    tasks: Array<BXTask>,
): Array<EventTask> => {
    return tasks.map((task: BXTask) => {
        const { type, name, eventType } = parseTaskTitle(task.title);
        const isExpired = checkIfTaskIsOverdue(task);
        const deadline = getFormatDate(task.deadline);

        return {
            ...task,
            name,
            type,
            eventType,
            isExpired,
            deadline,
            // Человекочитаемый deadline перетирает сырой ISO, а он нужен
            // переносу: план встаёт на дату текущей задачи, а разбирать
            // обратно «20 августа 2026 10:00» — гиблое дело.
            deadlineRaw: task.deadline ?? null,
            eventComment: getTaskEventComment(task),
            presentation: null,
            dealBase: null,
        } as EventTask;
    });
};

export const checkIfTaskIsOverdue = (task: BXTask): 'no' | 'almost' | 'yes' => {
    let result: 'no' | 'almost' | 'yes' = 'no';
    // Задача без срока — не «просрочена»: new Date(null) дал бы 1970 год,
    // и карточка рисовала бы висячий «просрочен · » с пустой датой.
    if (!task.deadline) return result;
    const now = new Date();
    const deadline = new Date(task.deadline);
    if (deadline < now) {
        result = 'yes';
    } else {
        deadline.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        if (now.getTime() === deadline.getTime()) {
            result = 'almost';
        }
    }
    return result;
};

/**
 * Имя события из заголовка задачи.
 *
 * Заголовки нашего флоу собраны как `<Тип>  <Имя события>  <Контакт?>` —
 * разделитель двойной пробел (бэк, `buildTitle` в
 * event-report-task-flow.service). Берём вторую секцию: это ровно то, что
 * ввёл менеджер.
 *
 * Прежний глобальный стрип типовых слов калечил имя («Звонок по решению
 * qwe» → «по решению  qwe») и ОБНУЛЯЛ его у заголовка из одного типа
 * («Доработка» → «»). Пустое имя переносом заходило в план, оттуда — в
 * заголовок следующей задачи и в KPI-запись: «Доработка: » без названия,
 * и так по кругу (todo3108 №3).
 *
 * Заголовок без структуры (робот, ручная задача) — прежний стрип: там
 * секций нет, и типовое слово из имени убрать больше нечем.
 */
const eventNameFromTitle = (title: string, typeRegex: RegExp): string => {
    const sections = title
        .split(/\s{2,}/)
        .map(section => section.trim())
        .filter(Boolean);
    if (sections.length >= 2) return sections[1]!;
    return title.replace(typeRegex, '').trim();
};

/** Тип/имя события из заголовка Bitrix-задачи (сервисный сигнал — цифры в скобках по краям). */
export const parseTaskTitle = (title: string) => {
    let type: EV_TYPE = EV_TYPE.WARM;
    const phrases = [
        'Холодный звонок',
        'Холодный обзвон',
        'Звонок',
        'Презентация',
        'Доработка',
        'Решение',
        'Звонок по решению',
        'Оплата',
        'Звонок по оплате',
        'Поставка',
    ];

    // Длинные фразы первыми: альтернация регулярки берёт ПЕРВОЕ совпадение,
    // и при исходном порядке «Звонок» откусывался от «Звонок по решению»,
    // оставляя в имени обрубок «по решению».
    const regex = new RegExp(
        `(?:${[...phrases].sort((a, b) => b.length - a.length).join('|')})`,
        'gi',
    );
    const name = title;

    // Тип по умолчанию — обычный звонок: код 'event' был легаси-синонимом
    // 'warm' и на бэке всё равно нормализовался в него.
    let eventType: EventTaskEventType = 'warm';
    if (name.includes('Холодный звонок') || name.includes('Холодный обзвон')) {
        // «Холодный звонок. Заявка» и «. Лид» — не холодный обзвон: клиент
        // обратился сам и нас ЖДЁТ. Слово в заголовке ставит робот воронки
        // заявок, оно и есть признак (см. docs/event-sales-event-types.md).
        if (name.includes('Заявка')) {
            eventType = 'xoRequest';
            type = EV_TYPE.REQUEST;
        } else if (name.includes('Лид')) {
            eventType = 'xoLead';
            type = EV_TYPE.REQUEST;
        } else {
            eventType = 'xo';
            type = EV_TYPE.XO;
        }
    } else if (/^[^\p{L}]*Доработка/u.test(name)) {
        // ДО ветки «Звонок» и строго ПЕРВЫМ словом (после эмодзи-префикса
        // «🔧 »): includes ловил бы «Доработка» в свободном тексте плана —
        // «Звонок  Доработка сметы» уезжал бы в refine вместо warm.
        type = EV_TYPE.REFINE;
        eventType = 'refine';
    } else if (name.includes('Звонок') && !name.includes('Звонок по')) {
        eventType = 'warm';
    } else if (name.includes('Презентация')) {
        type = EV_TYPE.PRES;
        eventType = 'presentation';
    } else if (name.includes('Решение') || name.includes('Звонок по решению')) {
        type = EV_TYPE.HOT;
        eventType = 'hot';
    } else if (name.includes('Оплата') || name.includes('Звонок по оплате')) {
        eventType = 'moneyAwait';
        type = EV_TYPE.MONEY;
    } else if (
        name.includes('Поставка') ||
        name.includes('Звонок по поставке')
    ) {
        eventType = 'supply';
        type = EV_TYPE.SUPPLY;
    }

    const isSS = /^\(\d+\)/.test(title) && /\(\d+\)$/.test(title);
    if (isSS) {
        eventType = 'ss';
        type = EV_TYPE.SS;
    }

    return {
        type,
        name: eventNameFromTitle(title, regex),
        eventType,
    };
};

/**
 * Текст описания задачи в пригодном для саммари виде: Bitrix отдаёт его в
 * BBCode (`descriptionInBbcode: 'Y'`), иногда с html-обрывками. Обрезку по
 * длине здесь НЕ делаем — за неё отвечает CSS (line-clamp), иначе рвём слова.
 */
export const getTaskSummary = (
    description: string | null | undefined,
): string => {
    if (!description) return '';
    return description
        .replace(/\[\/?[^\]]+\]/g, ' ') // bbcode-теги
        .replace(/<[^>]+>/g, ' ') // html-теги
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

export const getFormatDate = (date: string) => {
    if (!date) return '';
    return format(parseISO(date), 'd MMMM yyyy HH:mm', { locale: ru });
};

export const getPresTasksFromEventTasks = (
    evTasks: EventTask[],
): EventTask[] => {
    return evTasks.filter(task => task.eventType === 'presentation');
};
