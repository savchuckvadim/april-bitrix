import { describe, expect, it } from 'vitest';
import {
    buildChoiceItems,
    CHOICE_DEFAULT,
    fromChoiceValue,
    toChoiceValue,
} from './setting-choice';

const options = [
    { code: 'own', name: 'Только себя' },
    { code: 'group', name: 'Свою группу' },
];
const texts = { defaultHint: 'По умолчанию', foreignHint: '(не из справочника)' };

describe('setting-choice: настройка-выбор из справочника', () => {
    it('null ↔ пункт «По умолчанию», код ↔ сам код', () => {
        expect(toChoiceValue(null)).toBe(CHOICE_DEFAULT);
        expect(toChoiceValue('group')).toBe('group');
        expect(fromChoiceValue(CHOICE_DEFAULT)).toBeNull();
        expect(fromChoiceValue('group')).toBe('group');
    });

    it('первый пункт — дефолт с именем опции, дальше справочник', () => {
        expect(buildChoiceItems(options, 'own', null, texts)).toEqual([
            { value: CHOICE_DEFAULT, label: 'По умолчанию (Только себя)' },
            { value: 'own', label: 'Только себя' },
            { value: 'group', label: 'Свою группу' },
        ]);
    });

    it('дефолт вне справочника показывается кодом', () => {
        expect(buildChoiceItems(options, 'legacy', null, texts)[0]?.label).toBe(
            'По умолчанию (legacy)',
        );
    });

    it('текущее значение вне справочника — отдельный пункт с пометкой, не стирается', () => {
        const items = buildChoiceItems(options, 'own', 'everyone', texts);
        expect(items.at(-1)).toEqual({
            value: 'everyone',
            label: 'everyone (не из справочника)',
        });
        // значение из справочника лишнего пункта не добавляет
        expect(buildChoiceItems(options, 'own', 'group', texts)).toHaveLength(3);
    });
});
