import { describe, expect, it } from 'vitest';
import type { Provider } from '../../model/dto';
import { resolveCurrentProvider } from '../resolve-current-provider.util';

const provider = (id: string, name: string): Provider =>
    ({ id, name, rqId: id, domain: 'gsr.bitrix24.ru', withTax: false }) as Provider;

const providers = [provider('1', 'Гарант-Сервис'), provider('2', 'Гарант-Юг')];

describe('resolveCurrentProvider', () => {
    it('поле сделки сильнее настройки пользователя', () => {
        expect(resolveCurrentProvider(providers, 'Гарант-Юг', '1')?.id).toBe('2');
    });

    it('без поля сделки — ранее выбранный', () => {
        expect(resolveCurrentProvider(providers, null, '2')?.id).toBe('2');
    });

    it('незнакомые имя и id — первый в списке', () => {
        expect(resolveCurrentProvider(providers, 'Нет такого', '9')?.id).toBe('1');
    });

    it('пустой список — null', () => {
        expect(resolveCurrentProvider([], 'Гарант-Юг', '1')).toBeNull();
    });
});
