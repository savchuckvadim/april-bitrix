import { EV_TYPE } from '../../types/task-types';
import { PresentationStateCount } from '../../types/presentation-types';
import { IBXDeal, EBXTaskMark } from '../../shared/bitrix/bitrix.interface';

/**
 * Тип события задачи, приходящий с фрейма.
 *
 * Набор ОБЯЗАН совпадать с `@lib/shared/event-sales/dto/task.dto` — это тот
 * же контракт, только здесь он документируется в OpenAPI и валидируется
 * `@IsEnum`. Значения, которых тут нет, глобальный ValidationPipe отвергает
 * на входе, поэтому список расширяется, а не переписывается.
 *
 * Холодная работа разделена на три типа: `xo` — настоящий холодный обзвон
 * (клиент нас не ждёт), `xoRequest` — заявка, `xoLead` — входящий
 * лид/обращение. По стадиям воронки все три ведут себя как холодные, но в
 * KPI пишутся РАЗНЫМИ кодами события: заявка не должна сливаться с ХО.
 *
 * Вид определяется В БИТРИКСЕ и приезжает во фрейм СЛОВОМ В ЗАГОЛОВКЕ задачи
 * («Холодный звонок. Заявка …» / «… Лид …»); фрейм разбирает заголовок и
 * возвращает сюда готовый код. Бэк по данным лида вид не угадывает.
 *
 * `in_progress`/`money_await` — коды старых сборок фрейма; нормализация
 * (`EventReportContext.normalizeEventType`) сводит их к `hot`/`moneyAwait`.
 */
export enum EnumTaskEventType {
    XO = 'xo',
    /** Заявка: холодная стадия, но клиент обратился сам. */
    XO_REQUEST = 'xoRequest',
    /** Входящий лид/обращение (звонок, чат, письмо). */
    XO_LEAD = 'xoLead',
    WARM = 'warm',
    PRESENTATION = 'presentation',
    HOT = 'hot',
    /** Доработка: клиент дорабатывается после решения. */
    REFINE = 'refine',
    MONEY_AWAIT_NEW = 'moneyAwait',
    /** Сервисный сигнал: своего кода в отчётности нет, считается звонком. */
    SS = 'ss',
    /** @deprecated код старой сборки фрейма, нормализуется в `hot`. */
    IN_PROGRESS = 'in_progress',
    /** @deprecated код старой сборки фрейма, нормализуется в `moneyAwait`. */
    MONEY_AWAIT = 'money_await',
    EVENT = 'event',
    SUPPLY = 'supply',
}

/** Признак просроченности задачи. */
export const TASK_IS_EXPIRED_VALUES = ['no', 'almost', 'yes'] as const;
export type TaskIsExpired = (typeof TASK_IS_EXPIRED_VALUES)[number];

export interface EventTaskUserDto {
    /** Идентификатор пользователя задачи. */
    id: number;

    /** Имя пользователя (ФИО). */
    name?: string;

    /** Ссылка на иконку/аватар пользователя. */
    icon?: string;

    /** Должность пользователя. */
    workPosition?: string;
}

export interface EventTaskGroupDto {
    /** Идентификатор рабочей группы/проекта задачи. */
    id: number;
}

export interface EventTaskDto {
    /** Идентификатор задачи Bitrix. */
    id: number;

    /** Название задачи. */
    name: string;

    /**
     * СЫРОЙ заголовок задачи Bitrix («<Тип>  <Имя события>  <Контакт?>»).
     * Страховка имени: фрейм присылает `name` уже разобранным, и у старых
     * сборок разбор мог его обнулить — тогда имя события достаётся отсюда
     * (см. reportEventName).
     */
    title?: string;

    /** Внутренний тип задачи (`EV_TYPE`). */
    type: EV_TYPE;

    /** Признак просроченности задачи. */
    isExpired: TaskIsExpired;

    /** Тип события задачи, определяющий ветку flow. */
    eventType: EnumTaskEventType;

    /**
     * Состояние счётчиков презентаций по задаче (`PresentationStateCount`).
     * `null`, если презентаций нет.
     */
    presentation: null | PresentationStateCount;

    /**
     * Базовая сделка задачи (`IBXDeal`). `null`, если сделки нет.
     * Структура соответствует сделке Bitrix.
     */
    dealBase: null | IBXDeal;

    /** Исходный тип события до переопределения (`presentation` или `null`). */
    originalEventType?: 'presentation' | null;

    /** Признак отмены презентации по задаче. */
    isPresentationCanceled?: boolean;

    /** Постановщик задачи. */
    creator: EventTaskUserDto;

    /** Срок (дедлайн) задачи (ISO 8601). */
    deadline: string;

    /** Рабочая группа задачи. */
    group: EventTaskGroupDto;

    /** Идентификатор рабочей группы задачи. */
    groupId: number;

    /** Оценка/маркер задачи Bitrix (`EBXTaskMark`). */
    mark: EBXTaskMark;

    /** Ответственный за задачу. */
    responsible: EventTaskUserDto;

    /** Идентификатор ответственного за задачу. */
    responsibleId: number;

    /**
     * Идентификаторы привязанных к задаче сделок (UF_CRM_TASK).
     * Из них init-фаза достаёт presDeal/tmcDeal.
     */
    ufCrmTask: string[];

    // === Сырые поля задачи Bitrix (IBXTask), эхом возвращаемые фронтом. ===
    // В контракт API не входят, поэтому не документируются через @ApiProperty.
    accomplices: [];
    accomplicesData: [];
    activityDate: '2017-12-29T13:07:19+03:00';
    addInReport: 'N';
    allowChangeDeadline: 'Y';
    allowTimeTracking: 'N';
    auditors: [];
    auditorsData: [];
    changedBy: '1';
    changedDate: '2017-12-29T13:07:19+03:00';
    closedBy: '81';
    closedDate: '2017-12-29T13:06:18+03:00';
    commentsCount: null;
    createdBy: '1';
    createdDate: '2017-12-29T12:15:42+03:00';
    dateStart: '2017-12-29T13:04:29+03:00';
    description: string;
    descriptionInBbcode: 'Y';
    durationFact: null;
    durationPlan: null;
    durationType: 'days';
    endDatePlan: null;
    exchangeId: null;
    exchangeModified: null;
    favorite: 'N';
    forkedByTemplateId: null;
    forumId: null;
    forumTopicId: null;
    guid: '{9bd11fb5-8e76-4379-b3be-1f4cbe9bae1d}';
    isMuted: 'N';
    isPinned: 'N';
    isPinnedInGroup: 'N';
    matchWorkTime: 'N';
    multitask: 'N';
    newCommentsCount: 0;
    notViewed: 'N';
    outlookVersion: '4';
    parentId: null;
    priority: '0';
    replicate: 'N';
    serviceCommentsCount: null;
    siteId: 's1';
    sorting: null;
    stageId: '0';
    startDatePlan: null;
    status: '5';
    statusChangedBy: '81';
    statusChangedDate: '2017-12-29T13:06:18+03:00';
    subStatus: '5';
    subordinate: 'N';
    taskControl: 'N';
    timeEstimate: '0';
    timeSpentInLogs: null;
    // title объявлен ВЫШЕ: на бэке ему нужны декораторы, иначе whitelist
    // глобального пайпа срезает сырой заголовок (todo3108 №3).
    viewedDate: '2017-12-29T19:44:28+03:00';
    xmlId: null;
}
