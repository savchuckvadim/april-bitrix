import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale/ru";
import { BXTask } from "@workspace/bx";
import { EV_SERVICE_PLAN_CODE, EventPlanServiceCall } from "@/modules/entities/EventPlan/type/event-plan-service-type";
import { EV_TYPE, EventTask } from "@/modules/entities/EventTask/types/event-task-type";
import { getServiceSignalTaskGroupId } from "@workspace/pbx";
import { COMMUNICATION_INITIATIVE, COMMUNICATION_INITIATIVE_NAMES, COMMUNICATION_TYPE, COMMUNICATION_TYPE_NAME } from "@/modules/features/Communication/type/communications-type";

//utils

export const getEvServiceTasksFromBxTasks =
  (tasks: BXTask[], serviceEventTypes: EventPlanServiceCall[], domain: string) => {
    const resultTasks = tasks.map((task: BXTask) => {
      const { type, name, eventType } = parseTaskTitle(task, task.title, serviceEventTypes, domain);

      const isExpired = checkIfTaskIsOverdue(task);
      const deadline = getFormatDate(task.deadline);
      const ssGroupId = getServiceSignalTaskGroupId(domain);
      const currentGroupId = Number(task.groupId);
      const isSignal = ssGroupId === currentGroupId;
      const { initiative, communicationType } = parseTaskDescription(task, isSignal);

      return {
        ...task,
        name,
        type,
        eventType,
        isExpired,
        deadline,
        presentation: null,
        dealBase: null,
        initiative,
        communicationType,

      } as EventTask;
    }) as Array<EventTask>;
    return resultTasks;
  };

export const checkIfTaskIsOverdue = (task: BXTask): "no" | "almost" | "yes" => {
  let result = "no" as "no" | "almost" | "yes";
  const now = new Date(); // Текущее время
  const deadline = new Date(task.deadline); // Преобразуем строку deadline в объект Date
  if (deadline < now) {
    result = "yes";
  } else {
    deadline.setHours(0, 0, 0, 0); // Убираем время, оставляем только дату
    now.setHours(0, 0, 0, 0);
    const isNearlyOverdue = now.getTime() === deadline.getTime();

    if (isNearlyOverdue) {
      result = "almost";
    }
  }
  return result;
};

export const parseTaskTitle = (
  task: BXTask,
  title: string,
  serviceEventTypes: EventPlanServiceCall[],
  domain: string
) => {
  const ssGroupId = getServiceSignalTaskGroupId(domain);
  const currentGroupId = Number(task.groupId);
  const isSignal = ssGroupId === currentGroupId;

  let type = "Звонок";

  const phrases = [
    "Холодный звонок",
    "Холодный обзвон",
    "Звонок",
    "Презентация",
    "Решение",
    "Звонок по решению",
    "Оплата",
    "Звонок по оплате",
    "Информация",
    "Информационный звонок Гарант",
    "Ответ на обращение",
    "Обучение Первичное",
    "Обучение",
    "Сервисный сигнал",
    "Документы",
    "Общение по продлению",
    "Дебиторка",
    "Обработка угрозы отказа",
  ];

  const regex = new RegExp(`(?:${phrases.join("|")})`, "gi");

  let eventType = "event";

  serviceEventTypes.forEach((planEventType) => {
    // Берем только часть до первого двоеточия
    const beforeColon = title.split(":")[0].trim();

    if (beforeColon.includes(planEventType.name)) {
      eventType = planEventType.code;
      type = planEventType.name;
    }
    if (beforeColon.includes("Сервисный") || isSignal) {
      eventType = EV_SERVICE_PLAN_CODE.SS;
      type = EV_TYPE.SS;
    }
    if (beforeColon.includes("Первичное")) {
      eventType = EV_SERVICE_PLAN_CODE.LEARNING_FIRST;
      type = EV_TYPE.LEARNING_FIRST;
    }
  });
  
  // Теперь передаем `phrases` в `extractName`
  const name = extractName(title, phrases);

  return { type, name, eventType };
};


// Проверяем наличие цифр в скобках в начале и конце строки
// const isSS = /^\(\d+\)/.test(title) && /\(\d+\)$/.test(title);

// if (isSS) {
//   eventType = "ss";
//   type = EV_TYPE.SS;
// }

const extractName = (title: string, phrases: string[]) => {
  // Разделяем строку по двоеточию (если есть)
  const [beforeColon, afterColon] = title.split(":").map(s => s.trim());

  // Находим первое совпадение с фразами в `beforeColon`
  const firstMatch = phrases.find(phrase => beforeColon.includes(phrase));

  // Если найдено совпадение, оставляем его, а все остальное удаляем
  if (firstMatch) {

    return `${afterColon || ""}`.trim();
  }

  // Если нет совпадения, возвращаем оригинальное название
  return title.trim();
};




export const parseTaskDescription = (task: BXTask, isSignal: boolean) => {
  let initiative = COMMUNICATION_INITIATIVE.MANAGER;
  let communicationType = COMMUNICATION_TYPE.CALL;

  if (isSignal) {
    initiative = COMMUNICATION_INITIATIVE.CLIENT;
    communicationType = COMMUNICATION_TYPE.SS;
  } else if (task && task.description) {


    const input = task.description;

    const initiativeMatch = input.match(/Инициатива:\s*(.+)/);
    const communicationTypeMatch = input.match(/Тип коммуникации:\s*(.+)/);

    const initiativeRow = initiativeMatch ? initiativeMatch[1] : null as COMMUNICATION_INITIATIVE_NAMES | null;
    const communicationTypeRow = communicationTypeMatch ? communicationTypeMatch[1] : null as COMMUNICATION_TYPE_NAME | null;
    if (initiativeRow) {
      if (initiativeRow === COMMUNICATION_INITIATIVE_NAMES.CLIENT) {
        initiative = COMMUNICATION_INITIATIVE.CLIENT;
      } else if (initiativeRow === COMMUNICATION_INITIATIVE_NAMES.MANAGER) {
        initiative = COMMUNICATION_INITIATIVE.MANAGER;
      }
    }

    if (communicationTypeRow) {
      if (communicationTypeRow === COMMUNICATION_TYPE_NAME.FACE) {
        communicationType = COMMUNICATION_TYPE.FACE;
      } else if (communicationTypeRow === COMMUNICATION_TYPE_NAME.EDO) {
        communicationType = COMMUNICATION_TYPE.EDO;
      } else if (communicationTypeRow === COMMUNICATION_TYPE_NAME.EMAIL) {
        communicationType = COMMUNICATION_TYPE.EMAIL;
      } else if (communicationTypeRow === COMMUNICATION_TYPE_NAME.SS) {
        communicationType = COMMUNICATION_TYPE.SS;
      } else if (communicationTypeRow === COMMUNICATION_TYPE_NAME.CALL) {
        communicationType = COMMUNICATION_TYPE.CALL;
      }
    }
    
    console.log(initiativeRow); // "исходящий"
    console.log(communicationTypeRow); // "Телефон"

  }
  return {
    initiative,
    communicationType
  }
}
export const getFormatDate = (date: string) => {
  if (date) {
    const parsedDate = parseISO(date);

    // Форматируем дату в более читаемый вид
    const formattedDate = format(parsedDate, "d MMMM yyyy HH:mm", { locale: ru });
    return formattedDate;
  }
  return "";
};



export const getIsTaskServiceSignal = (task: EventTask, domain: string) => {
  const ssGroupId = getServiceSignalTaskGroupId(domain);
  const currentGroupId = Number(task.groupId);
  const isSignal = ssGroupId === currentGroupId;
  return isSignal;
}
