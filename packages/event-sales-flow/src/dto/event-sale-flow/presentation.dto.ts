export interface PresentationCountDto {
    /** Количество презентаций, привязанных к компании. */
    company: number;

    /** Количество презентаций, привязанных к смарт-процессу. */
    smart: number;

    /** Количество презентаций, привязанных к сделке. */
    deal: number;
}

/**
 * Ответы анкеты «5К/Хвост» — ВМЕСТЕ С ОТЧЁТОМ.
 *
 * Опросник после презентации — такой же ответ при отчёте, как и портальные
 * анкеты смартов (`questionnaireAnswers`), поэтому и едет он так же: в
 * payload. Значения раскладывает основной поток — в лид, сделки и компанию
 * тем же батчем, что и сам отчёт; смарты и презентационные сделки берут их
 * ОТСЮДА, а не перечитывают сущности. Это снимает целый класс ловушек:
 * «анкету отправили после отчёта — снимок пуст», «во встройке в сделку
 * лида нет — зеркало читает пустоту», «три писателя одного значения
 * разъехались».
 *
 * Формы и семантика — ТЕ ЖЕ, что у `values` легаси-ручки
 * `/event-sales/presentation-survey` (`PresentationSurveyValuesDto`): один
 * смысл — один формат. Ключи вне жёсткого серверного whitelist
 * (`shared/presentation-survey`) молча отбрасываются, значения длиннее
 * лимита обрезаются.
 */
export interface PresentationSurveyAnswersDto {
    /**
     * Сводный «Хвост» — о чём договорились после презентации
     * (op_presentation_xvost). Длиннее 5000 символов — обрезается.
     */
    xvost?: string;

    /**
     * Сводка «Пять К» одним текстом (op_presentation_5k). Длиннее 5000
     * символов — обрезается.
     */
    fiveKSummary?: string;

    /**
     * Детальные ответы «5К»: ключ — код поля (op_5k_client_what,
     * op_5k_client_ready, op_5k_client_price, op_5k_company_who,
     * op_5k_company_how, op_5k_company_right, op_5k_command,
     * op_5k_concurent, op_5k_criteri), значение — ответ менеджера. Ключи
     * вне этого списка молча отбрасываются. Пишутся в лид и сделки
     * (контекстную/базовую и презентационные).
     */
    fiveK?: Record<string, string>;

    /**
     * Шесть вопросов «Разговора»: ключ — код поля (op_talk_impression,
     * op_talk_remembered, op_talk_desire, op_talk_decision_process,
     * op_talk_price_opinion, op_talk_boss_readiness), значение — ответ
     * менеджера. Тот же whitelist и те же цели записи, что у «5К».
     */
    talk?: Record<string, string>;
}

export interface PresentationDto {
    /** Счётчики презентаций по типам привязки. */
    count: PresentationCountDto;

    /** Признак того, что презентация была проведена. */
    isPresentationDone: boolean;

    /** Признак внеплановой (незапланированной) презентации. */
    isUnplannedPresentation: boolean;

    /**
     * Ответы анкеты «5К/Хвост» после презентации. Поле НЕ прислано —
     * прежнее поведение: старые сборки фрейма шлют анкету отдельным
     * запросом в легаси-ручку `/event-sales/presentation-survey`, и поток
     * ведёт себя ровно как раньше (ни одной новой команды).
     */
    survey?: PresentationSurveyAnswersDto;
}
