/**
 * Комментарий недозвона собирается «как в легаси»: к тексту менеджера
 * дописываются выбранный контакт и номер, на который не дозвонились, чтобы
 * в истории клиента было видно, кому и куда звонили.
 */

/** Телефон компании в удобном для выбора виде. */
export interface CompanyPhoneOption {
    id: string;
    value: string;
}

/** Дописать строку в конец комментария новой строкой; пусто — как есть. */
export const appendCommentLine = (text: string, line: string): string => {
    const value = line.trim();
    if (!value) return text;
    return text ? `${text}\n${value}` : value;
};

/**
 * Имя контакта в комментарии: при выборе дописывается новой строкой, при
 * смене контакта прежнее имя заменяется новым, при снятии — убирается.
 * Ровно так вёл себя легаси-фронт (`NoCallMenu`), менеджеры к этому привыкли.
 */
export const withContactName = (
    text: string,
    previousName: string | null,
    nextName: string | null,
): string => {
    const prev = previousName?.trim() ?? '';
    const next = nextName?.trim() ?? '';
    if (next) {
        if (prev && text.includes(prev)) return text.replace(prev, next);
        if (text.includes(next)) return text;
        return appendCommentLine(text, next);
    }
    if (prev && text.includes(`\n${prev}`)) return text.replace(`\n${prev}`, '');
    if (prev && text === prev) return '';
    return text;
};

/** Полное имя контакта для комментария; без имени — null. */
export const contactDisplayName = (
    contact: { NAME?: unknown; LAST_NAME?: unknown } | null | undefined,
): string | null => {
    if (!contact) return null;
    const name = [contact.LAST_NAME, contact.NAME]
        .filter((part): part is string => typeof part === 'string')
        .map(part => part.trim())
        .filter(Boolean)
        .join(' ');
    return name || null;
};

/**
 * Телефоны компании из карточки Битрикса. Поле приходит множественным
 * (`[{ID, VALUE, VALUE_TYPE}]`); на всякий случай принимаем и строку.
 */
export const companyPhoneOptions = (
    rawPhones: unknown,
): CompanyPhoneOption[] => {
    if (typeof rawPhones === 'string') {
        const value = rawPhones.trim();
        return value ? [{ id: value, value }] : [];
    }
    if (!Array.isArray(rawPhones)) return [];
    const seen = new Set<string>();
    const options: CompanyPhoneOption[] = [];
    for (const raw of rawPhones) {
        const phone = raw as { ID?: unknown; VALUE?: unknown } | null;
        const value =
            typeof phone?.VALUE === 'string' ? phone.VALUE.trim() : '';
        if (!value || seen.has(value)) continue;
        seen.add(value);
        options.push({
            id: phone?.ID != null ? String(phone.ID) : value,
            value,
        });
    }
    return options;
};
