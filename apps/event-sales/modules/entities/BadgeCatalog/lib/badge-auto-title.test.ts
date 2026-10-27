import { describe, expect, it } from 'vitest';
import { resolveAutoTitle, type AutoTitleInput } from './badge-auto-title';

const input = (over: Partial<AutoTitleInput> = {}): AutoTitleInput => ({
    currentName: '',
    lastAutoTitle: '',
    hasType: true,
    defaultText: null,
    clientName: 'ООО Ромашка',
    maxLength: 250,
    ...over,
});

describe('resolveAutoTitle', () => {
    // «Звонок + имя клиента»: слово типа добавит заголовок задачи сам.
    it('пустое поле, основного текста нет — одно имя клиента', () => {
        expect(resolveAutoTitle(input())).toBe('ООО Ромашка');
    });

    it('основной текст портала — «текст — клиент»', () => {
        expect(resolveAutoTitle(input({ defaultText: 'Сотрудничество' }))).toBe(
            'Сотрудничество — ООО Ромашка',
        );
    });

    it('без типа события — не трогаем', () => {
        expect(resolveAutoTitle(input({ hasType: false }))).toBeNull();
    });

    it('написанное рукой не затираем', () => {
        expect(resolveAutoTitle(input({ currentName: 'договорились о КП' }))).toBeNull();
    });

    it('свой прошлый автотекст заменяем при смене типа', () => {
        expect(
            resolveAutoTitle(
                input({
                    currentName: 'ООО Ромашка',
                    lastAutoTitle: 'ООО Ромашка',
                    defaultText: 'Показ системы',
                }),
            ),
        ).toBe('Показ системы — ООО Ромашка');
    });

    it('то же значение повторно не ставим, пустого клиента не ставим', () => {
        expect(
            resolveAutoTitle(input({ currentName: 'ООО Ромашка', lastAutoTitle: 'ООО Ромашка' })),
        ).toBeNull();
        expect(resolveAutoTitle(input({ clientName: '  ' }))).toBeNull();
    });

    // Иначе проверка отправки отказала бы за то, чего менеджер не писал.
    it('длинное название обрезается до предела поля', () => {
        const title = resolveAutoTitle(input({ clientName: 'А'.repeat(300), maxLength: 250 }));
        expect(title).toHaveLength(250);
    });
});
