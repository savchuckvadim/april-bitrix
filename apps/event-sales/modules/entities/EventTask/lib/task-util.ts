import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import type { BXTask } from '@workspace/bx';
import { EV_TYPE, EventTask, EventTaskEventType } from '../types/event-task-type';

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
            presentation: null,
            dealBase: null,
        } as EventTask;
    });
};

export const checkIfTaskIsOverdue = (task: BXTask): 'no' | 'almost' | 'yes' => {
    let result: 'no' | 'almost' | 'yes' = 'no';
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
        eventType = 'in_progress';
    } else if (name.includes('Оплата') || name.includes('Звонок по оплате')) {
        eventType = 'money_await';
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

export const getFormatDate = (date: string) => {
    if (!date) return '';
    return format(parseISO(date), 'd MMMM yyyy HH:mm', { locale: ru });
};

export const getPresTasksFromEventTasks = (evTasks: EventTask[]): EventTask[] => {
    return evTasks.filter(task => task.eventType === 'presentation');
};
