/**
 * Сколько осталось до передачи заявки по SLA. Чистые функции — данные
 * отдельно от тикающего хука.
 */

/** Час на подтверждение — тот же порог, что у SLA-крона на бэке. */
export const SLA_MINUTES = 60;

/**
 * Время назначения из поля лида. Портал отдаёт ISO либо CRM-формат
 * `DD.MM.YYYY HH:mm:ss` — принимаем оба; непонятное — null, таймер честно
 * не показывается, а не врёт.
 */
export const parseAssignedAt = (raw: unknown): number | null => {
    if (typeof raw !== 'string' || !raw.trim()) return null;

    // CRM-формат разбираем ПЕРВЫМ: Date.parse('05.08.2026…') в V8 молча
    // читает это как «8 мая» — для дней 1–12 месяц и день менялись
    // местами, и таймер показывал ложную просрочку или сотни тысяч минут.
    const crm = raw.match(
        /^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/,
    );
    if (!crm) {
        const iso = Date.parse(raw);
        return Number.isNaN(iso) ? null : iso;
    }
    const [, day, month, year, hours, minutes, seconds = '0'] = crm;
    const ts = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hours),
        Number(minutes),
        Number(seconds),
    ).getTime();
    return Number.isNaN(ts) ? null : ts;
};

export interface SlaCountdown {
    minutesLeft: number;
    isOverdue: boolean;
}

export const getSlaCountdown = (
    assignedAtTs: number,
    now: number,
    slaMinutes = SLA_MINUTES,
): SlaCountdown => {
    const minutesLeft = Math.ceil(
        (assignedAtTs + slaMinutes * 60_000 - now) / 60_000,
    );
    return {
        minutesLeft: Math.max(0, minutesLeft),
        isOverdue: minutesLeft <= 0,
    };
};
