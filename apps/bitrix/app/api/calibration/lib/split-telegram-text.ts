/**
 * Потолок одной части. У бэка лимит текста 4000 символов, и он же дописывает
 * префикс («App / Domain / UserId») и экранирует `_*[` и бэктик — каждый
 * такой символ удлиняет текст на один. Берём с запасом, чтобы ни одна часть
 * не легла в усечение.
 */
export const TELEGRAM_PART_MAX_LENGTH = 3000;

/** Режет строку, не помещающуюся в часть целиком, на куски по лимиту. */
const splitLongLine = (line: string, max: number): string[] => {
    const chunks: string[] = [];
    for (let start = 0; start < line.length; start += max) {
        chunks.push(line.slice(start, start + max));
    }
    return chunks;
};

/**
 * Делит текст на части не длиннее `max`, стараясь рвать по границам строк:
 * протокол читается по вопросам, и вопрос не должен разъезжаться по двум
 * сообщениям без нужды.
 */
export const splitTelegramText = (
    text: string,
    max: number = TELEGRAM_PART_MAX_LENGTH,
): string[] => {
    const parts: string[] = [];
    let current = '';

    const flush = () => {
        if (current) parts.push(current);
        current = '';
    };

    text.split('\n').forEach((rawLine) => {
        splitLongLine(rawLine, max).forEach((line) => {
            const candidate = current ? `${current}\n${line}` : line;
            if (candidate.length > max) {
                flush();
                current = line;
                return;
            }
            current = candidate;
        });
    });
    flush();

    return parts.length ? parts : [''];
};
