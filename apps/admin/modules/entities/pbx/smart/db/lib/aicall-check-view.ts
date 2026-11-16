import type { AicallCheckResult } from '../model';

/** Итог проверки полей смарта словами — для окна установки. */
export interface AicallCheckView {
    status: 'not-installed' | 'ok' | 'gaps';
    /** Счётчики: поля конфига, поля методики, всего полей у смарта. */
    summary: string[];
    /** Недостающие поля сводки методики. */
    missingMethodology: string[];
    /** Остальные недостающие поля. */
    missingOther: string[];
    /** Списки с недостающими значениями. */
    enumGaps: string[];
    /** Лишние поля смарта. */
    extra: string[];
    /** Что сделать. */
    advice: string;
}

const NOT_INSTALLED_ADVICE =
    'Смарта на портале нет — запустите установку: она создаст тип и поля.';

const OK_ADVICE = 'Все поля на месте, установка не нужна.';

const MISSING_ADVICE =
    'Недостающие поля и значения списков создаёт установка — она безопасна и ' +
    'доливает только то, чего нет.';

const LIMIT_ADVICE =
    'Если установка упирается в лимит полей Битрикс24, сначала удалите в ' +
    'самом смарте лишние поля: каждое освобождает одно место. Лимит считается ' +
    'на одну сущность — удаление полей в сделках не поможет.';

const withSection = (title: string, section: string | null): string =>
    section ? `${title} (раздел «${section}»)` : title;

/** Ответ проверки → строки для окна. */
export function toAicallCheckView(result: AicallCheckResult): AicallCheckView {
    if (!result.installed) {
        return {
            status: 'not-installed',
            summary: [],
            missingMethodology: [],
            missingOther: [],
            enumGaps: [],
            extra: [],
            advice: NOT_INSTALLED_ADVICE,
        };
    }
    const missing = result.missing.map((field) => ({
        methodology: field.methodology,
        line: withSection(field.title, field.section),
    }));
    const extra = result.extra.map((field) =>
        field.title ? `${field.title} — ${field.fieldName}` : field.fieldName,
    );
    const hasGaps = result.missing.length > 0 || result.enumGaps.length > 0;
    return {
        status: hasGaps ? 'gaps' : 'ok',
        summary: [
            `Полей по конфигу: ${result.expected}, на портале есть: ${result.present}`,
            `Поля сводки методики: ${result.methodologyPresent} из ${result.methodologyExpected}`,
            `Всего полей у смарта на портале: ${result.total}` +
                (extra.length > 0 ? `, из них лишних: ${extra.length}` : ''),
        ],
        missingMethodology: missing
            .filter((item) => item.methodology)
            .map((item) => item.line),
        missingOther: missing
            .filter((item) => !item.methodology)
            .map((item) => item.line),
        enumGaps: result.enumGaps.map(
            (gap) =>
                `${gap.title}: нет значений ${gap.missing.map((value) => `«${value}»`).join(', ')}`,
        ),
        extra,
        advice: hasGaps
            ? result.missing.length > 0 && extra.length > 0
                ? `${MISSING_ADVICE} ${LIMIT_ADVICE}`
                : MISSING_ADVICE
            : OK_ADVICE,
    };
}
