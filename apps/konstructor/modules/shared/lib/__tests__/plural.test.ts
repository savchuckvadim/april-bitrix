import { describe, expect, it } from 'vitest';
import { pluralRu } from '../plural';

const FORMS = ['позиция', 'позиции', 'позиций'] as const;

describe('pluralRu', () => {
    it('выбирает форму по последним цифрам', () => {
        expect(pluralRu(1, FORMS)).toBe('позиция');
        expect(pluralRu(2, FORMS)).toBe('позиции');
        expect(pluralRu(4, FORMS)).toBe('позиции');
        expect(pluralRu(5, FORMS)).toBe('позиций');
        expect(pluralRu(11, FORMS)).toBe('позиций');
        expect(pluralRu(14, FORMS)).toBe('позиций');
        expect(pluralRu(21, FORMS)).toBe('позиция');
        expect(pluralRu(112, FORMS)).toBe('позиций');
        expect(pluralRu(0, FORMS)).toBe('позиций');
    });
});
