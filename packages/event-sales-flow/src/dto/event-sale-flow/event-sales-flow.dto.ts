import {
    EnumLeadNotCaTypeCode,
    EnumLeadSiteStageCode,
    EnumLeadSiteStatusCode,
} from '../../shared/pbx-lead-request/type/pbx-lead-request.enum';
import { IBXDeal } from '../../shared/bitrix/bitrix.interface';
import { PlanDto } from './plan.dto';
import { ReportDto } from './report.dto';
import { EventTaskDto } from './task.dto';
import { OpenEventTaskDto } from './open-task.dto';
import { PlacementDto } from './placement.dto';
import { EvFlowContextDto } from './flow-context.dto';
import { ContactDto } from './contact.dto';
import { SaleDto } from './sale.dto';
import { DepartamentDto } from './department.dto';
import { FailDto } from './fail.dto';
import { LeadDto } from './lead.dto';
import { PresentationDto } from './presentation.dto';
import { QuestionnaireAnswerDto } from './questionnaire-answer.dto';

/**
 * TMC-сделка для возврата (legacy-тип фронта `TmcDealsForReturn`:
 * `{ taskId, tmcDeal, presDeal? }`).
 */
export interface TmcDealForReturnDto {
    /** Идентификатор задачи Bitrix, к которой привязана сделка. */
    taskId?: number;

    /** TMC-сделка Bitrix (`IBXDeal`). Структура соответствует сделке Bitrix. */
    tmcDeal?: IBXDeal;

    /** Связанная сделка-презентация (`IBXDeal`), если есть. */
    presDeal?: IBXDeal | null;
}

/**
 * Синхронизация связанной заявки/лида из отчёта «Звонков». Два сценария:
 *  - финал (отказ/продажа): фронт испрашивает недостающие статусы
 *    («не ЦА» — при отказе), бэк двигает op_lead_site_* / op_lead_status
 *    связанных лидов и дописывает историю обработки заявки;
 *  - презентация связана с заявкой (модалка перед отправкой): фронт шлёт
 *    выбранный лид + обязательные статусы, бэк пишет их выбранному лиду,
 *    линкует презентацию (to_presentation_sales, L_ в KPI и задачи)
 *    и дописывает историю.
 */
export interface LeadRequestSyncDto {
    /**
     * Лид (заявка), с которым менеджер связал презентацию.
     * Обязателен при presentationLink=true.
     */
    leadId?: number;

    /**
     * Презентация этого отчёта связана с заявкой leadId: бэк
     * добавит L_лид в KPI-записи и задачи, залинкует сделку
     * презентации в лид и допишет историю заявки.
     */
    presentationLink?: boolean;

    /**
     * Статус заявки, выбранный менеджером (обязателен в модалке
     * связи презентации). Применяется выбранному лиду.
     */
    siteStatusCode?: EnumLeadSiteStatusCode;

    /**
     * Стадия заявки, выбранная менеджером (обязательна в модалке
     * связи презентации). Применяется выбранному лиду.
     */
    siteStageCode?: EnumLeadSiteStageCode;

    /**
     * Тип «не ЦА» — обязателен, когда менеджер квалифицирует отказ
     * как «не ЦА». Пустой при обычном отказе или продаже.
     */
    notCaTypeCode?: EnumLeadNotCaTypeCode;

    /**
     * Произвольная заметка менеджера — попадёт строкой в историю
     * обработки заявки (op_lead_firstprepare_history).
     */
    note?: string;
}

/** Возврат сущности в ТМЦ. */
export interface ReturnToTmcDto {
    /**
     * Найденная TMC-сделка для возврата (legacy `TmcDealsForReturn`).
     * Legacy-фронт может прислать вместо объекта falsy-значение
     * (false/0/null), поэтому строгая валидация поля не выполняется.
     */
    data?: TmcDealForReturnDto | boolean | null;

    /** Признак активности ветки возврата в ТМЦ. */
    isActive?: boolean;
}

export interface EventSalesFlowDto {
    /**
     * Домен портала Bitrix клиента. По нему `PBXService.init` отдаёт
     * инстанс bitrix и портал с ключами доступа.
     */
    domain: string;

    /**
     * Идентификатор операции, сгенерированный клиентом (UUID). Отчёт —
     * команда: повторный POST с тем же id не выполнит её второй раз, а
     * вернёт статус уже принятой операции. Не передан — сервер выдаст свой.
     */
    operationId?: string;

    /**
     * socket.io-идентификатор клиента: на него уйдёт push с исходом
     * операции. Не передан — клиент узнает результат поллингом статуса.
     */
    socketId?: string;

    /** План звонка: тип, ответственный, дедлайн, контакт. */
    plan: PlanDto;

    /** Отчёт по событию: статус результата, причины, контакт. */
    report: ReportDto;

    /** Текущая задача, по которой отчитывается менеджер. */
    currentTask?: EventTaskDto;

    /**
     * ВСЕ открытые дела клиента (включая ту задачу, по которой идёт
     * отчёт — бэк исключит её сам). По ним считаются «дата следующего
     * события» и «дата назначенной презентации»: у клиента может быть
     * несколько открытых дел, и ближайшим окажется не обязательно то,
     * которое планирует этот отчёт. Поле НЕ прислано — прежнее
     * поведение (даты пишутся планом вслепую).
     */
    openTasks?: OpenEventTaskDto[];

    /**
     * Ответы анкет портального каталога, адресованные полям ЭЛЕМЕНТА
     * смарта (презентации, ЗПР). Значения — в каноне каталога: код
     * варианта, «YYYY-MM-DD», «Y»/«N». Бэк сам находит поле и тот
     * элемент, который создаёт или закрывает поток этого отчёта —
     * включая спонтанный для незапланированного события. Поле НЕ
     * прислано — прежнее поведение (анкеты в смарт не пишутся).
     */
    questionnaireAnswers?: QuestionnaireAnswerDto[];

    /**
     * Честный контекст встройки: тип + id сущностей. Приоритетный
     * источник владельца события; `placement` остаётся только как
     * фолбэк для старых клиентов.
     */
    context?: EvFlowContextDto;

    /**
     * Контекст встройки Bitrix (placement), из которой пришло событие.
     * @deprecated Владельца события описывает `context`; поле держим для BC.
     * Старые клиенты подделывали здесь CRM_COMPANY_DETAIL_TAB;
     * новые шлют реальный placement и `context`.
     */
    placement?: PlacementDto;

    /** Контакт события. `null`, если контакт не выбран. */
    contact?: ContactDto | null;

    /** Данные продажи (связка презентация ↔ сделка). `null`, если нет. */
    sale?: SaleDto | null;

    /** Подразделение/режим, в котором выполняется flow. */
    departament?: DepartamentDto;

    /** Параметры пост-фейл обработки (дата повторного касания). */
    fail?: FailDto;

    /** Признак пост-продажного сценария. */
    isPostSale?: boolean;

    /** Параметры возврата сущности в ТМЦ. */
    returnToTmc?: ReturnToTmcDto;

    /** Лид, связанный с событием. */
    lead?: LeadDto;

    /** Данные презентации: счётчики и флаги проведения. */
    presentation: PresentationDto;

    /**
     * Синхронизация связанной заявки при финале (отказ/продажа):
     * тип «не ЦА», заметка в историю обработки.
     */
    leadSync?: LeadRequestSyncDto;
}
