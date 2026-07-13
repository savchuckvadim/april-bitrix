import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale/ru";
import { EV_TYPE, EventTask } from "../types/event-task-type";
import { BXTask } from "@workspace/bx";

//utils

export const getEvTasksFromBxTasks = (tasks: Array<BXTask>) => {
    const resultTasks = tasks.map((task: BXTask) => {

        const { type, name, eventType } = parseTaskTitle(task.title)
        const isExpired = checkIfTaskIsOverdue(task)
        const deadline = getFormatDate(task.deadline)
        
        return {
            ...task,
            name,
            type,
            eventType,
            isExpired,
            deadline,
            presentation: null,
            dealBase: null,
        } as EventTask




    }) as Array<EventTask>
    return resultTasks;

}





export const checkIfTaskIsOverdue = (task: BXTask): 'no' | 'almost' | 'yes' => {
    let result = 'no' as 'no' | 'almost' | 'yes'
    const now = new Date(); // Текущее время
    const deadline = new Date(task.deadline); // Преобразуем строку deadline в объект Date
    if (deadline < now) {
        result = 'yes'
    } else {
        deadline.setHours(0, 0, 0, 0); // Убираем время, оставляем только дату
        now.setHours(0, 0, 0, 0);
        const isNearlyOverdue = now.getTime() === deadline.getTime();

        if (isNearlyOverdue) {
            result = 'almost'

        }

    }
    return result;
}



// export const parseTaskTitle = (title: string) => {
//     // const typePattern = /^(.*?)(?=\sзапланирован)/;
//     // const namePattern = /запланирован[ао]?\s+(.*?)\s+\d{2}\.\d{2}\.\d{4}/;

//     // const typeMatch = title.match(typePattern);
//     // const nameMatch = title.match(namePattern);

//     let type = 'Звонок';
//     const phrases = [
//         "Холодный звонок",
//         "Холодный обзвон",
//         "Звонок",
//         "Презентация",
//         "Решение",
//         "Звонок по решению",
//         "Оплата",
//         "Звонок по оплате"
//     ];

//     const regex = new RegExp(`(?:${phrases.join("|")})`, "gi");
//     // const nameMatch = title.match(regex);
//     let name = title
    
//     let eventType = 'event';
//     if (name.includes("Холодный звонок") || name.includes("Холодный обзвон")) {
//         eventType = 'xo';
//         type = EV_TYPE.XO
//     } else if (name.includes("Звонок") && !name.includes("Звонок по")) {
//         eventType = 'warm';
//     } else if (name.includes("Презентация")) {
//         type = EV_TYPE.PRES
//         eventType = 'presentation';
//     } else if (name.includes("Решение") || name.includes("Звонок по решению")) {
//         type = EV_TYPE.HOT
//         eventType = 'in_progress';
//     } else if (name.includes("Оплата") || name.includes("Звонок по оплате")) {
//         eventType = 'money_await';
//         type = EV_TYPE.MONEY

//     }
//     const extractName = (title: string) => {
//         // Удаляем совпадающие фразы
//         const cleanedTitle = title.replace(regex, "").trim();
//         return cleanedTitle;
//     };
//     name = extractName(title);
    
//     return { type, name, eventType };
// }

export const parseTaskTitle = (title: string) => {
    // const typePattern = /^(.*?)(?=\sзапланирован)/;
    // const namePattern = /запланирован[ао]?\s+(.*?)\s+\d{2}\.\d{2}\.\d{4}/;

    // const typeMatch = title.match(typePattern);
    // const nameMatch = title.match(namePattern);

    let type = 'Звонок';
    const phrases = [
        "Холодный звонок",
        "Холодный обзвон",
        "Звонок",
        "Презентация",
        "Решение",
        "Звонок по решению",
        "Оплата",
        "Звонок по оплате"
    ];

    const regex = new RegExp(`(?:${phrases.join("|")})`, "gi");
    // const nameMatch = title.match(regex);
    let name = title
    
    let eventType = 'event';
    if (name.includes("Холодный звонок") || name.includes("Холодный обзвон")) {
        eventType = 'xo';
        type = EV_TYPE.XO
    } else if (name.includes("Звонок") && !name.includes("Звонок по")) {
        eventType = 'warm';
    } else if (name.includes("Презентация")) {
        type = EV_TYPE.PRES
        eventType = 'presentation';
    } else if (name.includes("Решение") || name.includes("Звонок по решению")) {
        type = EV_TYPE.HOT
        eventType = 'in_progress';
    } else if (name.includes("Оплата") || name.includes("Звонок по оплате")) {
        eventType = 'money_await';
        type = EV_TYPE.MONEY

    }
     // Проверяем наличие цифр в скобках в начале и конце строки
     const isSS = /^\(\d+\)/.test(title) && /\(\d+\)$/.test(title);

     if (isSS) {
        eventType = 'ss';
        type = EV_TYPE.SS
     }

    const extractName = (title: string) => {
        // Удаляем совпадающие фразы
        const cleanedTitle = title.replace(regex, "").trim();
        return cleanedTitle;
    };
    name = extractName(title);
    
    return { type, name, eventType };
}

export const getFormatDate = (date: string) => {
    if (date) {
        const parsedDate = parseISO(date);

        // Форматируем дату в более читаемый вид
        const formattedDate = format(parsedDate, 'd MMMM yyyy HH:mm', { locale: ru });
        return formattedDate
    }
    return ''

}


