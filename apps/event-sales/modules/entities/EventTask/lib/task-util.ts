import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import type { BXTask } from '@workspace/bx';
import { EV_TYPE, EventTask, EventTaskEventType } from '../types/event-task-type';
import { getTaskEventComment } from './event-comment';

export const getEvTasksFromBxTasks = (tasks: Array<BXTask>): Array<EventTask> => {
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

/** Тип/имя события из заголовка Bitrix-задачи (сервисный сигнал — цифры в скобках по краям). */
export const parseTaskTitle = (title: string) => {
    let type: EV_TYPE = EV_TYPE.WARM;
    const phrases = [
        'Холодный звонок',
        'Холодный обзвон',
        'Звонок',
        'Презентация',
        'Решение',
        'Звонок по решению',
        'Оплата',
        'Звонок по оплате',
        'Поставка',
    ];

    const regex = new RegExp(`(?:${phrases.join('|')})`, 'gi');
    const name = title;

    let eventType: EventTaskEventType = 'event';
    if (name.includes('Холодный звонок') || name.includes('Холодный обзвон')) {
        eventType = 'xo';
        type = EV_TYPE.XO;
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
    } else if (name.includes('Поставка') || name.includes('Звонок по поставке')) {
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
        name: title.replace(regex, '').trim(),
        eventType,
    };
};

/**
 * Текст описания задачи в пригодном для саммари виде: Bitrix отдаёт его в
 * BBCode (`descriptionInBbcode: 'Y'`), иногда с html-обрывками. Обрезку по
 * длине здесь НЕ делаем — за неё отвечает CSS (line-clamp), иначе рвём слова.
 */
export const getTaskSummary = (description: string | null | undefined): string => {
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

export const getPresTasksFromEventTasks = (evTasks: EventTask[]): EventTask[] => {
    return evTasks.filter(task => task.eventType === 'presentation');
};
