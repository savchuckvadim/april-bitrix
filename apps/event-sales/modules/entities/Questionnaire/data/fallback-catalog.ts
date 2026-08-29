import type {
    QuestionnaireControl,
    QuestionnaireDef,
    QuestionnaireItem,
} from '../model';

/**
 * Встроенный каталог — то, что работает, когда портального каталога нет.
 *
 * Это боевой состав чек-листов, переложенный в доменный тип анкет:
 * прежний `features/CallChecklist/data/checklist-catalog.ts` удалён, движок
 * читает состав из стора, и встроенным источником остаётся ЭТОТ файл.
 *
 * Fallback — не теория, а основной сценарий: каталог отдаёт бэк, и его
 * недоступность (миграция не накатана, 500, таймаут, пустой домен) не имеет
 * права ни отменить вопросы, ни заблокировать отправку отчёта.
 *
 * `legacyChecklistId` совпадает с `code`: анкета портала с тем же значением
 * ЗАМЕЩАЕТ встроенный набор, иначе менеджер увидел бы два одинаковых блока.
 *
 * Заметки по полям (перенесены из каталога чек-листов):
 * - `op_objection_reason` («ОП Возражение клиента») — справочник возражений
 *   с тем же составом, что причины отказа. Раньше здесь стояло
 *   `op_efield_fail_reason`, и финальный отказ ПЕРЕЗАПИСЫВАЛ возражение
 *   своей причиной: два смысла в одном поле, свести историю нельзя.
 *   Теперь причина отказа принадлежит только финалу, возражение — своё
 *   поле и живёт по своей шкале времени (25.08).
 * - `op_invoice_date` — «Дата отправки Счета» из konstructor-реестра, уже
 *   стоит на порталах со сделками конструктора.
 * - `decision`/`sale` (`targetStage`) заполняются модалками перед отправкой —
 *   активируются, когда stage-predict сообщает целевую стадию.
 */

/**
 * Дефолты вопроса встроенного набора.
 *
 * `legacyFieldCode = code`: у встроенных вопросов код вопроса и код
 * pbx-поля совпадают (ответы там ключевались кодом поля), а UF-имя заранее
 * неизвестно — поле резолвится по слепку портала, а не по `field.name`.
 */
const legacyItem = (
    code: string,
    control: QuestionnaireControl,
    title: string,
    over: Partial<QuestionnaireItem> = {},
): QuestionnaireItem => ({
    code,
    title,
    placeholder: null,
    hint: null,
    groupTitle: null,
    sort: 0,
    control,
    isRequired: false,
    requireChange: false,
    staleAfterDays: null,
    channel: 'crm',
    dtoPath: null,
    target: { mode: 'auto', entity: null },
    smart: null,
    isNative: false,
    field: null,
    legacyFieldCode: code,
    options: [],
    ...over,
});

/** Анкеты ПЛАНИРОВАНИЯ: что нужно знать до следующего звонка. */
const FALLBACK_PLAN_QUESTIONNAIRES: QuestionnaireDef[] = [
    {
        code: 'refine',
        title: 'Чек-лист доработки',
        hint: 'Что мешает клиенту купить — возражение, с которым идём на доработку.',
        purpose: 'plan',
        presentation: 'inline',
        place: 'plan',
        persist: 'onChange',
        conditions: [{ kind: 'planType', values: ['refine'] }],
        configKey: 'withChecklistRefine',
        legacyChecklistId: 'refine',
        sort: 10,
        items: [
            legacyItem(
                'op_objection_reason',
                'enumeration',
                'Причина возражения',
                { sort: 10, isRequired: true },
            ),
        ],
    },
    {
        code: 'pay',
        title: 'Чек-лист оплаты',
        hint: 'Счёт должен быть выставлен до звонка по оплате.',
        purpose: 'plan',
        presentation: 'inline',
        place: 'plan',
        persist: 'onChange',
        conditions: [{ kind: 'planType', values: ['moneyAwait'] }],
        configKey: 'withChecklistPay',
        legacyChecklistId: 'pay',
        sort: 20,
        items: [
            legacyItem('op_invoice_date', 'datetime', 'Дата последнего счёта', {
                sort: 10,
                isRequired: true,
                // Смысл требования — «счёт выставлен ПЕРЕД этим звонком».
                // Без срока годности счёт годичной давности закрывал
                // пункт, и звонок по оплате планировался без счёта.
                staleAfterDays: 30,
            }),
        ],
    },
    {
        // Переход на «Клиент на решении»: направлены КП/договор/счёт
        // (даты-факты, konstructor-реестр) + дата звонка по решению
        // (новое поле, «выдернуто из Хвоста»). ВСЕ обязательны — по ТЗ.
        code: 'decision',
        title: 'Клиент на решении',
        hint: 'Сделка уходит на «Клиент на решении» — документы должны быть направлены, дата звонка по решению известна.',
        purpose: 'plan',
        presentation: 'modal',
        place: null,
        persist: 'onChange',
        conditions: [{ kind: 'targetStage', values: ['sales_in_progress'] }],
        configKey: 'withChecklistDecision',
        legacyChecklistId: 'decision',
        sort: 30,
        items: [
            legacyItem('op_offer_date', 'datetime', 'Направлено КП', {
                sort: 10,
                isRequired: true,
            }),
            legacyItem(
                'op_contract_date',
                'datetime',
                'Направлен проект договора',
                { sort: 20, isRequired: true },
            ),
            legacyItem('op_invoice_date', 'datetime', 'Направлен счёт', {
                sort: 30,
                isRequired: true,
            }),
            legacyItem(
                'op_xvost_decision_call_date',
                'date',
                'Дата звонка по решению',
                { sort: 40, isRequired: true },
            ),
        ],
    },
    {
        // Продажа: сумма → штатный OPPORTUNITY, дата оплаты → first_pay_date.
        // Оба уезжают DTO (sale-блок) — сделку может создавать сам flow,
        // фронту некуда писать заранее; сервер-гард дублирует обязательность.
        code: 'sale',
        title: 'Продажа',
        hint: 'Сумма сделки и дата первой оплаты обязательны при продаже.',
        purpose: 'plan',
        presentation: 'modal',
        place: null,
        persist: 'onChange',
        conditions: [{ kind: 'targetStage', values: ['sales_success'] }],
        configKey: 'withChecklistSale',
        legacyChecklistId: 'sale',
        sort: 40,
        items: [
            legacyItem('OPPORTUNITY', 'money', 'Сумма сделки', {
                sort: 10,
                isRequired: true,
                channel: 'dto',
                dtoPath: 'sale.opportunity',
                isNative: true,
                legacyFieldCode: null,
            }),
            // `legacyFieldCode` оставлен: ответ уезжает payload'ом (dto), но
            // одноимённое поле конструктора на порталах есть — по нему
            // модалка показывает «сейчас: …». Нет поля в слепке — вопрос
            // всё равно спрашивается: он обязателен, и сервер-гард его
            // продублирует.
            legacyItem('first_pay_date', 'date', 'Дата первой оплаты', {
                sort: 20,
                isRequired: true,
                channel: 'dto',
                dtoPath: 'sale.firstPayDate',
            }),
        ],
    },
];

/**
 * Анкеты ОТЧЁТНОСТИ — по типу события закрываемой задачи (25.08).
 *
 * Тип отчётного события до этого не влиял ни на что, кроме презентации:
 * самое содержательное — что ответил клиент — оставалось в свободном тексте
 * комментария. Здесь спрашивается то же самое, но в поля: по ним строится
 * аналитика возражений и решений.
 *
 * Все три включаются ОДНИМ флагом портала `withReportQuestions`: включают
 * их всегда вместе, а пять похожих галок в админке уже есть.
 *
 * Обязательных вопросов здесь нет намеренно: отчёт нельзя запирать за
 * вопросом, на который у менеджера может не быть ответа («клиент не
 * сказал»). Срок годности — на случай, когда вопрос всё же сделают
 * обязательным: прошлое возражение не должно закрывать сегодняшний разговор.
 */
const FALLBACK_REPORT_QUESTIONNAIRES: QuestionnaireDef[] = [
    {
        code: 'reportRefine',
        title: 'Итог доработки',
        hint: 'Что мешает клиенту купить прямо сейчас.',
        purpose: 'report',
        presentation: 'inline',
        place: 'report',
        persist: 'onChange',
        conditions: [{ kind: 'reportType', values: ['refine'] }],
        configKey: 'withReportQuestions',
        legacyChecklistId: 'reportRefine',
        sort: 50,
        items: [
            legacyItem(
                'op_objection_reason',
                'enumeration',
                'Возражение клиента',
                { sort: 10 },
            ),
            legacyItem(
                'op_objection_comment',
                'string',
                'Формулировка клиента',
                {
                    sort: 20,
                    placeholder: 'Как клиент сказал это своими словами',
                },
            ),
        ],
    },
    {
        code: 'reportDecision',
        title: 'Итог звонка по решению',
        hint: 'К чему пришли: решение принято, отложено или отказ.',
        purpose: 'report',
        presentation: 'inline',
        place: 'report',
        persist: 'onChange',
        conditions: [{ kind: 'reportType', values: ['hot'] }],
        configKey: 'withReportQuestions',
        legacyChecklistId: 'reportDecision',
        sort: 60,
        items: [
            legacyItem('op_decision_outcome', 'enumeration', 'Исход решения', {
                sort: 10,
            }),
            legacyItem('op_decision_date', 'date', 'Дата решения', {
                sort: 20,
                staleAfterDays: 14,
            }),
            legacyItem('op_objection_reason', 'enumeration', 'Что мешает', {
                sort: 30,
            }),
        ],
    },
    {
        code: 'reportPay',
        title: 'Итог звонка по оплате',
        hint: 'Когда клиент обещает оплатить.',
        purpose: 'report',
        presentation: 'inline',
        place: 'report',
        persist: 'onChange',
        conditions: [{ kind: 'reportType', values: ['moneyAwait'] }],
        configKey: 'withReportQuestions',
        legacyChecklistId: 'reportPay',
        sort: 70,
        items: [
            // Существующее поле «ОП Плановая дата покупки» — ровно то, что
            // менеджер выясняет звонком по оплате; заводить второе «дата
            // обещанной оплаты» значило бы раздвоить смысл.
            legacyItem(
                'op_sale_date_prognoz',
                'date',
                'Обещанная дата оплаты',
                { sort: 10, staleAfterDays: 14 },
            ),
            legacyItem('op_objection_comment', 'string', 'Что сказал клиент', {
                sort: 20,
                placeholder: 'Причина задержки, условия оплаты',
            }),
        ],
    },
];

export const FALLBACK_CATALOG: QuestionnaireDef[] = [
    ...FALLBACK_PLAN_QUESTIONNAIRES,
    ...FALLBACK_REPORT_QUESTIONNAIRES,
];
