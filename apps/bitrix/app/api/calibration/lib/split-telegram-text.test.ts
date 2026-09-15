import { describe, expect, it } from 'vitest';
import { splitTelegramText } from './split-telegram-text';

describe('деление текста на части для Telegram', () => {
    it('короткий текст — одна часть', () => {
        expect(splitTelegramText('a\nb', 10)).toEqual(['a\nb']);
    });

    it('рвёт по границам строк, не превышая лимит', () => {
        const parts = splitTelegramText('aaaa\nbbbb\ncccc', 9);
        expect(parts).toEqual(['aaaa\nbbbb', 'cccc']);
        parts.forEach((part) => expect(part.length).toBeLessThanOrEqual(9));
    });

    it('строку длиннее лимита режет на куски', () => {
        expect(splitTelegramText('abcdefgh', 3)).toEqual(['abc', 'def', 'gh']);
    });

    it('пустой текст — одна пустая часть', () => {
        expect(splitTelegramText('', 5)).toEqual(['']);
    });
});
