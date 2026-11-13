import { describe, expect, it } from 'vitest';
import {
    durationLabel,
    transcriptionProviderLabel,
    transcriptionStatusLabel,
} from './transcription-labels';

describe('подписи списка транскрипций', () => {
    it('распознаватель и статус по-русски, неизвестное — как есть, пусто — прочерк', () => {
        expect(transcriptionProviderLabel('yandex')).toBe('Яндекс');
        expect(transcriptionProviderLabel('bitrix-vibecode')).toBe('VibeCode');
        expect(transcriptionProviderLabel('openai')).toBe('openai');
        expect(transcriptionProviderLabel(null)).toBe('—');
        expect(transcriptionStatusLabel('done')).toBe('Готово');
        expect(transcriptionStatusLabel('weird')).toBe('weird');
    });

    it('длительность: минуты и секунды, с часами — часы:минуты:секунды', () => {
        expect(durationLabel(734)).toBe('12:14');
        expect(durationLabel(5)).toBe('0:05');
        expect(durationLabel(3725)).toBe('1:02:05');
        expect(durationLabel(null)).toBe('—');
        expect(durationLabel(-1)).toBe('—');
    });
});
