/**
 * Типы событий, которые менеджер планирует и по которым отчитывается.
 *
 * Коды и порядок сверены с `event-report`: `EnumEventPlanCode` и лестница
 * SALES_BASE_EVENT_ORDER. Порядок — не украшение: именно по нему считается,
 * на какую стадию уедет сделка, и именно поэтому стадию нельзя понизить.
 */

export interface SimEventType {
    /** Код плана, как в DTO приложения «Звонки». */
    code: string;
    label: string;
    /** Куда двигает основную сделку. */
    targetStageId: string;
    /** Место в лестнице: выигрывает максимальный. */
    order: number;
    /** Эмодзи важного события — как в заголовке задачи. */
    emoji?: string;
    /** Пишется ли по этому событию запись KPI (mapEventType). */
    writesKpi: boolean;
    hint: string;
    /**
     * Значение атрибута data-event-type — им приложение «Звонки» красит форму.
     * Атрибут переопределяет --event-current, и всё внутри перекрашивается
     * само. Здесь тот же приём, чтобы цвета совпадали с оригиналом.
     */
    dataEventType: string;
    /**
     * Можно ли выбрать это событие при планировании ИЗ приложения «Звонки».
     *
     * Список сверен с PLAN_CALL_TYPES реального приложения
     * (`apps/event-sales/modules/entities/EventPlan/lib/plan-util.ts`): там
     * ровно пять типов — звонок, презентация, решение, оплата, поставка.
     * Холодного звонка среди них нет намеренно: холодная задача приходит
     * только извне — её ставит хук ХО. Планировать можно «от обычного
     * звонка и выше»: назад по лестнице приложение не пускает так же, как не
     * пускает стадию сделки.
     */
    isPlannable: boolean;
}

export const SIM_EVENT_TYPES: SimEventType[] = [
    {
        code: 'cold',
        label: 'Холодный звонок',
        targetStageId: 'sales_cold',
        order: 0,
        writesKpi: true,
        hint: 'первый контакт: пройти секретаря, выйти на ЛПР',
        dataEventType: 'xo',
        isPlannable: false,
    },
    {
        code: 'coldLead',
        label: 'Холодный звонок · заявка',
        targetStageId: 'sales_cold',
        order: 0,
        writesKpi: true,
        hint: 'тот же первый контакт, но клиент уже оставил заявку — разговор начинается не с нуля',
        dataEventType: 'lead',
        isPlannable: false,
    },
    {
        code: 'warm',
        label: 'Звонок',
        targetStageId: 'sales_warm',
        order: 1,
        writesKpi: true,
        hint: 'предварительные договорённости и текущая работа',
        dataEventType: 'warm',
        isPlannable: true,
    },
    {
        code: 'presentation',
        label: 'Презентация',
        targetStageId: 'sales_pres',
        order: 2,
        emoji: '⚡',
        writesKpi: true,
        hint: 'особое событие: заводится отдельная сделка-спутник',
        dataEventType: 'presentation',
        isPlannable: true,
    },
    {
        code: 'document',
        label: 'Документы',
        targetStageId: 'sales_offer_create',
        order: 3,
        writesKpi: false,
        hint: 'готовим и отправляем КП — записи KPI у документов нет',
        dataEventType: 'warm',
        isPlannable: false,
    },
    {
        code: 'hot',
        label: 'Звонок по решению',
        targetStageId: 'sales_in_progress',
        order: 4,
        emoji: '🔥',
        writesKpi: true,
        hint: 'клиент думает — самый решающий момент',
        dataEventType: 'in_progress',
        isPlannable: true,
    },
    {
        code: 'moneyAwait',
        label: 'Звонок по оплате',
        targetStageId: 'sales_money_await',
        order: 5,
        emoji: '💎',
        writesKpi: true,
        hint: 'напомнить об оплате, снять вопросы по счёту',
        dataEventType: 'money_await',
        isPlannable: true,
    },
    {
        code: 'supply',
        label: 'Поставка',
        targetStageId: 'sales_supply',
        order: 6,
        emoji: '🚚',
        writesKpi: false,
        hint: 'постпродажный тип: не двигает лестницу и не пишет KPI',
        dataEventType: 'supply',
        isPlannable: true,
    },
];

/** Причины нерезультативности — точный список из `report-types.ts`. */
export const SIM_NORESULT_REASONS = [
    { code: 'secretar', label: 'Не пустил секретарь' },
    { code: 'nopickup', label: 'Трубку не берут' },
    { code: 'nonumber', label: 'Такого номера нет' },
    { code: 'busy', label: 'Занято' },
    { code: 'noresult_notime', label: 'У собеседника нет времени' },
    { code: 'nocontact', label: 'Нужного человека нет на месте' },
    { code: 'giveup', label: 'Просят оставить номер, перезвонят сами' },
    { code: 'bay', label: 'Не интересует, прощание' },
    { code: 'wrong', label: 'Попали не в ту организацию' },
    { code: 'auto', label: 'Автоответчик' },
];

/**
 * Статусы работы с клиентом — `EnumWorkStatusCode` / `EnumWorkStatusName`.
 *
 * «Отложено» менеджер НЕ выбирает: в приложении оно отфильтровано из списка
 * (`getCurrentWorkStatusItems`) и появляется только само, когда следующее
 * событие запланировано слишком далеко. Показываем его так же — как следствие
 * даты, а не как кнопку.
 */
export const SIM_WORK_STATUSES = [
    { code: 'inJob', label: 'В работе', isPickable: true },
    { code: 'setAside', label: 'Отложено', isPickable: false },
    { code: 'success', label: 'Продажа', isPickable: true },
    { code: 'fail', label: 'Отказ', isPickable: true },
];

export const SIM_PICKABLE_WORK_STATUSES = SIM_WORK_STATUSES.filter(
    status => status.isPickable,
);

/**
 * Какие статусы видно прямо сейчас.
 *
 * Повторяет `getCurrentWorkStatusItems` реального приложения: «В работе» и
 * «Отложено» взаимоисключаются. Пока работа не отложена, «Отложено» в списке
 * нет вовсе; как только сработал далёкий срок — оно занимает место «В работе»
 * и становится текущим.
 */
export const visibleWorkStatuses = (isSetAside: boolean) =>
    SIM_WORK_STATUSES.filter(status =>
        status.code === 'setAside'
            ? isSetAside
            : status.code === 'inJob'
              ? !isSetAside
              : status.isPickable,
    );

/**
 * Сроки планирования. `monthsAhead` нужен, чтобы повторить правило приложения:
 * дальше четырёх календарных месяцев — работа с клиентом считается отложенной.
 *
 * Порог именно такой: `isDifferenceMoreThanFourMonths` сравнивает год и месяц,
 * без учёта дней, и срабатывает при разнице строго больше четырёх — то есть
 * начиная с пятого месяца.
 */
export const SIM_DEADLINES = [
    { code: 'tomorrow', label: 'завтра, 10:00', monthsAhead: 0 },
    { code: 'week', label: 'через неделю', monthsAhead: 0 },
    { code: 'month', label: 'через месяц', monthsAhead: 1 },
    { code: 'quarter', label: 'через три месяца', monthsAhead: 3 },
    { code: 'half', label: 'через полгода', monthsAhead: 6 },
    { code: 'year', label: 'через год', monthsAhead: 12 },
];

/** Порог, после которого приложение само переводит работу в «Отложено». */
export const SET_ASIDE_MONTHS = 4;

export const findDeadline = (code: string) =>
    SIM_DEADLINES.find(item => item.code === code);

/** Отложена ли работа при таком сроке — правило приложения, не наше. */
export const isSetAsideDeadline = (code: string): boolean =>
    (findDeadline(code)?.monthsAhead ?? 0) > SET_ASIDE_MONTHS;

export const findEventType = (code: string): SimEventType | undefined =>
    SIM_EVENT_TYPES.find(item => item.code === code);

/** Что менеджер может запланировать сам — только это и предлагаем. */
export const SIM_PLANNABLE_EVENTS = SIM_EVENT_TYPES.filter(
    event => event.isPlannable,
);

/** Чем работа может начаться: такие задачи ставит хук, а не менеджер. */
export const SIM_ARRIVING_EVENTS = SIM_EVENT_TYPES.filter(
    event => !event.isPlannable,
);

/** Причины отказа — точный список FailType из `report-types.ts`. */
export const SIM_FAIL_TYPES = [
    { code: 'failure', label: 'Отказ' },
    { code: 'garant', label: 'Гарант/Запрет' },
    { code: 'go', label: 'Покупает ГО' },
    { code: 'territory', label: 'Чужая территория' },
    { code: 'accountant', label: 'Бухприх' },
    { code: 'autsorc', label: 'Аутсорсинг' },
    { code: 'depend', label: 'Несамостоятельная организация' },
    { code: 'op_prospects_nophone', label: 'Недозвон' },
    { code: 'op_prospects_company', label: 'Компания не существует' },
];

/** Возражения — точный список FailReason из `report-types.ts`. */
export const SIM_FAIL_REASONS = [
    { code: 'noneed', label: 'Не видят надобности' },
    { code: 'fail_notime', label: 'Не было времени' },
    { code: 'c_habit', label: 'Конкуренты — привыкли' },
    { code: 'c_prepay', label: 'Конкуренты — оплачено' },
    { code: 'c_price', label: 'Конкуренты — цена' },
    { code: 'to_expensive', label: 'Дорого / нет денег' },
    { code: 'to_cheap', label: 'Слишком дёшево' },
    { code: 'nomoney', label: 'Нет денег' },
    { code: 'lpr', label: 'ЛПР против' },
    { code: 'employee', label: 'Ключевой сотрудник против' },
    { code: 'fail_off', label: 'Не хотят общаться' },
];

/**
 * Контакты компании.
 *
 * В приложении контакт выбирается ДВАЖДЫ и независимо: «С кем общались» в
 * отчёте и «Контакт» в плане. Это не дублирование — говорить могли с одним
 * человеком, а встречу назначать с другим.
 */
export const SIM_CONTACTS = [
    { id: 'c1', name: 'Ирина Кузнецова', role: 'секретарь' },
    { id: 'c2', name: 'Павел Дорохов', role: 'главный бухгалтер' },
    { id: 'c3', name: 'Сергей Мальцев', role: 'директор (ЛПР)' },
];

export const findFailType = (code: string) =>
    SIM_FAIL_TYPES.find(item => item.code === code);

export const findFailReason = (code: string) =>
    SIM_FAIL_REASONS.find(item => item.code === code);

export const findContact = (id: string | null) =>
    SIM_CONTACTS.find(item => item.id === id);

/**
 * Дела по другим компаниям — фон рабочего дня менеджера.
 *
 * Нужны не для красоты: без них симулятор внушает, будто менеджер ведёт одного
 * клиента. На самом деле он видит общий список, и ваш клиент в нём — одна
 * строка из полутора десятков. Открыть их нельзя: это не ваш сценарий.
 */
export const SIM_FOREIGN_TASKS = [
    {
        id: 'f1',
        title: 'Уточнить реквизиты',
        eventCode: 'warm',
        company: 'ООО «Ромашка»',
        deadline: 'сегодня, 11:30',
    },
    {
        id: 'f2',
        title: 'Встреча по договору',
        eventCode: 'presentation',
        company: 'АО «Северсталь-Трейд»',
        deadline: 'сегодня, 14:00',
    },
    {
        id: 'f3',
        title: 'Клиент думает — дожать',
        eventCode: 'hot',
        company: 'ИП Гордеев',
        deadline: 'сегодня, 16:00',
    },
    {
        id: 'f4',
        title: 'Напомнить об оплате',
        eventCode: 'moneyAwait',
        company: 'ООО «Вектор»',
        deadline: 'завтра, 09:30',
    },
    {
        id: 'f5',
        title: 'Первый звонок',
        eventCode: 'cold',
        company: 'ООО «Транссервис»',
        deadline: 'завтра, 10:00',
    },
];
