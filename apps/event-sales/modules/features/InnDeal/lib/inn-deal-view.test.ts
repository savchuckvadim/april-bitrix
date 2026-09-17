import { describe, expect, it } from 'vitest';
import type { InnCandidate, InnConflict, InnCurrent } from '../model';
import {
    innConflictTone,
    innDigitsLabel,
    innOriginLabel,
    innStrengthTone,
    innWriteErrorText,
    otherDealsLabel,
    splitInnCandidates,
} from './inn-deal-view';

const candidate = (patch: Partial<InnCandidate>): InnCandidate => ({
    inn: '7707083893',
    digits: 10,
    strength: 'normal',
    label: 'из накопленных вариантов сделки',
    sources: [],
    inPool: true,
    isCurrent: false,
    hidden: false,
    ...patch,
});

describe('splitInnCandidates', () => {
    it('скрытые варианты уезжают отдельным списком, а не пропадают', () => {
        const split = splitInnCandidates([
            candidate({ inn: '7707083893' }),
            candidate({ inn: '7812032055', hidden: true }),
        ]);

        expect(split.visible.map(item => item.inn)).toEqual(['7707083893']);
        expect(split.hidden.map(item => item.inn)).toEqual(['7812032055']);
    });
});

describe('подписи', () => {
    it('разрядность объясняется словами, а не цифрой', () => {
        expect(innDigitsLabel(10)).toContain('юрлицо');
        expect(innDigitsLabel(12)).toContain('ИП');
    });

    it('слабый вариант выделяется предупреждающим тоном', () => {
        expect(innStrengthTone('weak')).toBe('warning');
        expect(innStrengthTone('strong')).toBe('success');
    });

    it('расхождение уровня error красится как ошибка', () => {
        const conflict: InnConflict = {
            kind: 'requisite_mismatch',
            level: 'error',
            message: 'ИНН договора не совпадает с реквизитом',
        };
        expect(innConflictTone(conflict)).toBe('destructive');
    });

    it('происхождение «выбрал человек» показывает имя', () => {
        const current: InnCurrent = {
            inn: '7707083893',
            digits: 10,
            origin: 'manual',
            userName: 'Иванов Иван',
            unverified: false,
        };
        expect(innOriginLabel(current)).toBe('выбрал Иванов Иван');
    });

    it('сделки по тому же реквизиту перечисляются номерами', () => {
        expect(otherDealsLabel([812])).toContain('№812');
        expect(otherDealsLabel([])).toBe('');
    });
});

describe('innWriteErrorText', () => {
    /*
     * 409 приходит от бэка с человеческим текстом. Без разбора
     * `response.data.message` менеджер увидел бы «Request failed with status
     * code 409» и не понял бы, что карточку надо просто обновить.
     */
    it('берёт причину из ответа бэка', () => {
        const error = {
            response: { data: { message: 'Данные по ИНН изменились' } },
        };
        expect(innWriteErrorText(error)).toBe('Данные по ИНН изменились');
    });

    it('без ответа сервера подставляет свой текст', () => {
        expect(innWriteErrorText({})).toContain('Не удалось сохранить');
    });
});
