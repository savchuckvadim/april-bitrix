/**
 * Типы движка «Процесс». Движок не знает ничего про продажи: он принимает
 * описание процесса (ProcessDefinition) и конфигурацию портала (ProcessConfig)
 * и возвращает модель отрисовки (ProcessModel). Процесс продажи — первый такой
 * конфиг, процесс обслуживания появится рядом без правок движка.
 */

import type { TheoryPageContent } from './theory-types';

/**
 * Откуда руководитель берёт цифры о работе менеджера.
 *
 * Это не два способа померить одно и то же. Телефония знает «сколько и как
 * долго», отчёт знает «чем закончилось» — и одно из другого не выводится:
 * причины недозвона в детализации нет вовсе, а длительности разговора нет в
 * записи KPI.
 */
export type KpiSource = 'events' | 'calls' | 'both';

/**
 * Кто исполняет шаг.
 *
 * Администратор — отдельный актёр, а не разновидность руководителя. Разводить
 * их обязательно: администратор разбирает вход потоком, руководитель принимает
 * решения по спорному. Схлопнуть их — значит на схеме и в регламенте подписать
 * дешёвую операцию дорогой ролью.
 */
export type ProcessActor = 'sys' | 'adm' | 'mgr' | 'rop';

/** Какая сущность владеет стадией при текущей конфигурации портала. */
export type StageOwner = 'lead' | 'deal' | 'both' | 'none';

/** Готовность куска процесса — на схеме честно разделяем факт и планы. */
export type ProcessReadiness = 'live' | 'wip';

/** Стадия основного хребта процесса. */
export interface ProcessStage {
    /** Код стадии в портале (для sales — код воронки sales_base). */
    id: string;
    /** Подпись на схеме. */
    label: string;
    /** Идентификатор стадии в Битриксе — для сверки с порталом. */
    bitrixId: string;
    /**
     * Реальный цвет стадии из портала (`pbx-deal-sales-*.type.ts`).
     * Единственное место, где мы отходим от токенов тем: это не оформление,
     * а перенос того, что заказчик видит в своём Битриксе.
     */
    color: string;
    /** Одна строка пояснения под подписью. */
    hint?: string;
    /** Кто ведёт эту стадию по умолчанию. */
    actor: ProcessActor;
    /**
     * Что на этой стадии делает ЧЕЛОВЕК: какие события планирует и по каким
     * отчитывается. Это ответ на вопрос «что здесь вообще происходит».
     */
    managerDoes: string[];
    /**
     * Что система делает сама, когда менеджер отчитывается на этой стадии.
     * Только проверенные по коду факты — это главный аргумент страницы.
     */
    systemDoes: string[];
    /**
     * Пишется ли на этой стадии запись в «ОП KPI».
     * Сверено с mapEventType: у «Документов», «Отправленных» и «Поставки»
     * KPI-события нет — они живут только в лестнице сделок.
     */
    writesKpi: boolean;
    /**
     * Может ли стадию держать лид. Конверсионный хвост воронки лиду не
     * принадлежит никогда: к моменту закрытия сделки лид уже сконвертирован.
     */
    canBeLead: boolean;
    /** Стадия закрывает сделку: приложение перестаёт видеть её как текущую. */
    isClosing?: boolean;
}

/** Стадия воронки-спутника. */
export interface SatelliteStage {
    id: string;
    label: string;
    bitrixId: string;
    /** Реальный цвет стадии из портала. */
    color: string;
    /** Терминальная стадия — рисуется за разделителем. */
    isTerminal?: boolean;
}

/**
 * Воронка-спутник: живёт параллельной жизнью рядом с основной.
 * Это не метафора — в коде это отдельные категории сделок.
 */
export interface ProcessSatellite {
    id: string;
    /** Название воронки как в портале. */
    label: string;
    /** Код категории сделок в портале. */
    categoryCode: string;
    /** Чем она является для читателя, одной фразой. */
    summary: string;
    /** Как связана с основной воронкой. */
    link: string;
    /** Стадия хребта, напротив которой спутник «включается». */
    anchorStageId: string;
    stages: SatelliteStage[];
    readiness: ProcessReadiness;
}

/** Съезд с маршрута: тупик, отказ, передача другому сотруднику. */
export interface ProcessExit {
    id: string;
    label: string;
    /** Откуда можно съехать. Пусто — с любой стадии. */
    fromStageIds?: string[];
    /** Тон исхода для цветового кодирования. */
    tone: 'junk' | 'fail' | 'handover' | 'duplicate';
    hint?: string;
    readiness: ProcessReadiness;
    /** Кто принимает решение на этом съезде — задаётся ответом на вопрос. */
    actor?: ProcessActor;
}

/** Точка входа сущности в работу менеджера. */
export interface ProcessEntryPoint {
    id: string;
    label: string;
    hint?: string;
    readiness: ProcessReadiness;
}

/** Полное описание одного процесса. */
export interface ProcessDefinition {
    id: string;
    title: string;
    /** Код категории основной воронки в портале. */
    baseCategoryCode: string;
    stages: ProcessStage[];
    satellites: ProcessSatellite[];
    exits: ProcessExit[];
    entryPoints: ProcessEntryPoint[];
    /**
     * Повествовательные страницы процесса.
     *
     * Лежат в определении, а не рядом с ним, чтобы регламент мог собрать из них
     * список нерешённых развилок: врезка «Дискурс» обещает читателю, что вопрос
     * без ответа уходит в лист решений внедрения, — и это обещание надо держать.
     */
    theory?: TheoryPageContent[];
}

/**
 * Что вариант ответа делает с картинкой.
 *
 * Правило приёмки: вопрос, у которого нет ни одного эффекта, в пульт не
 * попадает. Иначе заказчик щёлкает переключателями и не понимает, работают они
 * или нет.
 */
export interface QuestionEffect {
    /** Сменить исполнителя на перечисленных стадиях. */
    actorFor?: { stageIds: string[]; actor: ProcessActor };
    /** Назначить того, кто принимает решение на съезде. */
    actorForExit?: { exitIds: string[]; actor: ProcessActor };
    /**
     * Сменить исполнителя конкретного шага процесса.
     *
     * Нужен там, где «кто владеет стадией» и «кто делает шаг» — разные вопросы.
     * Стадию «Новая» держит тот, кто первым смотрит лид; а попытку определить
     * компанию и ИНН может делать он же или кто-то другой. Через actorFor это
     * не выразить: два вопроса дрались бы за одну стадию.
     */
    actorForStep?: { stepIds: string[]; actor: ProcessActor };
    /** Дальше этой стадии лид не идёт, как бы ни была выкручена ползунок. */
    leadCapStageId?: string;
    /** Записи KPI начинаются только с этой стадии. */
    kpiFromStageId?: string;
    /** Откуда руководитель берёт цифры: события приложения, телефония или оба. */
    kpiSource?: KpiSource;
    /** Показать/скрыть съезды с маршрута. */
    hideExitIds?: string[];
    /** Убрать параллельную воронку: её нет в этом портале. */
    hideSatelliteIds?: string[];
    /** Убрать точку входа: этим путём клиенты не приходят. */
    hideEntryPointIds?: string[];
    /** Уточнить подпись съезда — когда ответ меняет смысл, а не наличие. */
    exitHints?: { exitIds: string[]; hint: string };
    /** Лид автоматически повторяет статусы сделки. */
    syncLeadStatuses?: boolean;
}

export interface ProcessQuestionOption {
    code: string;
    label: string;
    recommended?: boolean;
    effect?: QuestionEffect;
}

export interface ProcessQuestion {
    id: string;
    title: string;
    hint?: string;
    /** Одной строкой: на что этот вопрос влияет в схеме. */
    changes: string;
    options: ProcessQuestionOption[];
    /**
     * Выключенные вопросы видны, но не кликаются: замысел показываем целиком,
     * а включаем по мере того, как за ними появляется механика.
     */
    isActive: boolean;
    /** Почему пока выключен — показывается в подсказке. */
    inactiveReason?: string;
}

/** Конфигурация портала: то, что крутит пользователь. */
export interface ProcessConfig {
    /** Насколько далеко вперёд от начала тянется лид, 0..100. */
    leadPct: number;
    /** Насколько далеко назад от конца тянется сделка, 0..100. */
    dealPct: number;
    /** Ответы на вопросы-чекбоксы: questionId → код варианта. */
    answers: Record<string, string>;
    /**
     * Редактируемые списки: стадии сущностей и чек-лист по заявке.
     * Ключ — идентификатор списка, значение — строки в порядке отображения.
     * Пусто — берём состав по умолчанию из определения процесса.
     */
    lists?: Record<string, string[]>;
}

/** Именованная комбинация крутилок из документации. */
export interface ProcessPreset {
    id: string;
    label: string;
    leadPct: number;
    dealPct: number;
    /** Что это значит на языке заказчика. */
    meaning: string;
    /** Схема, которую мы советуем по умолчанию. Такая ровно одна. */
    recommended?: boolean;
    /** Почему советуем именно её. */
    whyRecommended?: string;
}

/**
 * Как соотносятся два покрытия:
 * - gap       — между ними дыра: часть процесса не ведётся нигде;
 * - seam      — стыкуются ровно, граница в одной точке;
 * - overlap   — перекрываются на нескольких стадиях;
 * - duplicate — полностью дублируют друг друга.
 */
export type CoverageRelation = 'gap' | 'seam' | 'overlap' | 'duplicate';

/** Стадия, разложенная для отрисовки. */
export interface StageView {
    stage: ProcessStage;
    index: number;
    owner: StageOwner;
    isLeadCovered: boolean;
    isDealCovered: boolean;
    /** Кто ведёт с учётом ответов на вопросы — может отличаться от stage.actor. */
    actor: ProcessActor;
    /** Пишется ли здесь запись KPI с учётом выбранной глубины отчётности. */
    writesKpi: boolean;
    /** Лид не дошёл сюда не из-за ползунка, а из-за регламента. */
    isBlockedForLead: boolean;
}

/** Где при этой конфигурации живёт приложение «Звонки». */
export interface CallsAppPlacement {
    inLead: boolean;
    inDeal: boolean;
    /** Оба контура сразу: форма одна, но открывается из двух мест. */
    isSplit: boolean;
}

/** Результат разбора конфигурации — всё, что нужно рендереру. */
export interface ProcessModel {
    stages: StageView[];
    /** Индекс последней стадии под лидом, -1 если лида нет. */
    leadEnd: number;
    /** Индекс первой стадии под сделкой. */
    dealStart: number;
    /** Сколько стадий держат обе сущности сразу. */
    overlapCount: number;
    /** Сколько стадий не держит никто. */
    gapCount: number;
    relation: CoverageRelation;
    callsApp: CallsAppPlacement;
    /** Съезды, оставшиеся после ответов на вопросы. */
    exits: ProcessExit[];
    /** Параллельные воронки, оставшиеся после ответов. */
    satellites: ProcessSatellite[];
    /** Точки входа, оставшиеся после ответов. */
    entryPoints: ProcessEntryPoint[];
    /** stepId → исполнитель, назначенный ответом. */
    stepActors: Map<string, ProcessActor>;
    /** Откуда берутся цифры отчётности при текущих ответах. */
    kpiSource: KpiSource;
    /** Стадия, на которой регламент останавливает лид. */
    leadCapStageId: string | null;
    /** Лид автоматически повторяет статусы сделки. */
    syncLeadStatuses: boolean;
}

// ─── Детальный процесс под хребтом ──────────────────────────────────────────
// Хребет показывает, ГДЕ идёт работа. Этот слой — ЧТО именно происходит:
// вход, цикл менеджера и исходы, со всеми развилками.

export type FlowStepKind = 'event' | 'action' | 'system' | 'gateway';

export type FlowBranchTone = 'neutral' | 'good' | 'warn' | 'bad';

/** Ветка развилки. */
export interface FlowBranch {
    id: string;
    /** Короткая подпись самой ветки. */
    label: string;
    /** Что происходит, если пошли сюда. */
    text: string;
    tone: FlowBranchTone;
    readiness?: ProcessReadiness;
    /**
     * Ветка ведёт к съезду с маршрута: ответственного возьмём из съезда,
     * чтобы подпись «решает руководитель» не разъезжалась с пультом.
     */
    exitId?: string;
    /** Ветка возвращает в цикл, а не идёт дальше. */
    loops?: boolean;
}

export interface FlowStep {
    id: string;
    kind: FlowStepKind;
    label: string;
    hint?: string;
    /**
     * Стадия хребта, которой соответствует шаг. Из неё берутся сущность
     * (лид/сделка) и исполнитель — то есть шаг сам подхватывает и ползунки,
     * и ответы на вопросы. Без неё шаг считается частью цикла и показывает
     * место работы приложения «Звонки».
     */
    stageId?: string;
    /** Запасной исполнитель, если шаг не привязан к стадии. */
    actor?: ProcessActor;
    readiness?: ProcessReadiness;
    /** Что система делает сама на этом шаге — только проверенное по коду. */
    systemDoes?: string[];
    branches?: FlowBranch[];
    /**
     * Шаг зависит от конфигурации: подпись подставляется из того, где стоит
     * приложение «Звонки» при текущих ползунках.
     */
    followsCallsPlacement?: boolean;
}

export interface FlowPhase {
    id: string;
    title: string;
    subtitle: string;
    steps: FlowStep[];
    /** Съезды с маршрута, возможные на этой фазе. Берутся из модели. */
    exitIds?: string[];
}
