import { describe, expect, it } from 'vitest';
import type { BXTask } from '@workspace/bx';
import { checkIfTaskIsOverdue, parseTaskTitle } from './task-util';
import { EV_TYPE } from '../types/event-task-type';

const task = (deadline: string | null): BXTask =>
    ({ deadline }) as unknown as BXTask;

describe('checkIfTaskIsOverdue', () => {
    it('задача без срока — «запланирован», а не 1970-й год', () => {
        expect(checkIfTaskIsOverdue(task(null))).toBe('no');
        expect(checkIfTaskIsOverdue(task(''))).toBe('no');
    });

    it('прошедший срок — просрочен', () => {
        expect(checkIfTaskIsOverdue(task('2000-01-01T10:00:00+03:00'))).toBe(
            'yes',
        );
    });

    it('будущий срок — запланирован', () => {
        expect(checkIfTaskIsOverdue(task('2099-01-01T10:00:00+03:00'))).toBe(
            'no',
        );
    });
});

describe('parseTaskTitle — «Доработка» (refine)', () => {
    it('распознаёт тип по первому слову заголовка', () => {
        const parsed = parseTaskTitle('Доработка  Снять вопросы по КП');
        expect(parsed.eventType).toBe('refine');
        expect(parsed.type).toBe(EV_TYPE.REFINE);
        expect(parsed.name).toBe('Снять вопросы по КП');
    });

    it('эмодзи-префикс задачи не мешает', () => {
        expect(parseTaskTitle('🔧 Доработка  Хвосты по цене').eventType).toBe(
            'refine',
        );
    });

    it('«Звонок» в названии НЕ перебивает доработку', () => {
        // Ветка «Доработка» стоит до проверки «Звонок»: иначе такой
        // заголовок читался бы как warm.
        const parsed = parseTaskTitle('Доработка  Звонок после КП');
        expect(parsed.eventType).toBe('refine');
    });

    it('обычный звонок не стал доработкой', () => {
        expect(parseTaskTitle('Звонок  Обсудить сроки').eventType).toBe('warm');
    });
});

describe('parseTaskTitle — имя события из заголовка', () => {
    // Заголовки флоу: «<Тип>  <Имя события>  <Контакт?>» через двойной
    // пробел. Прежний глобальный стрип типовых слов калечил имя, а имя
    // потом уезжало переносом в план и в KPI-запись (todo3108 №3).
    it('составной тип не откусывает кусок имени', () => {
        expect(parseTaskTitle('Звонок по решению  Обсудить смету').name).toBe(
            'Обсудить смету',
        );
        expect(parseTaskTitle('Звонок по оплате  Счёт от 1 сентября').name).toBe(
            'Счёт от 1 сентября',
        );
    });

    it('имя не теряет типовое слово внутри себя', () => {
        expect(parseTaskTitle('Звонок  Доработка сметы').name).toBe(
            'Доработка сметы',
        );
    });

    it('эмодзи-префикс остаётся в секции типа, а не в имени', () => {
        expect(parseTaskTitle('🔧 Доработка  Хвосты по цене').name).toBe(
            'Хвосты по цене',
        );
    });

    it('контакт третьей секцией в имя не попадает', () => {
        expect(
            parseTaskTitle('Холодный обзвон  ООО «Ромашка»  Иван').name,
        ).toBe('ООО «Ромашка»');
    });

    it('заголовок из одного типа даёт пустое имя, а не мусор', () => {
        // «Доработка» → '' (тип, а не название): пустое имя честнее обрубка
        // «по решению», а KPI-запись подставит имя типа сама.
        expect(parseTaskTitle('Доработка').name).toBe('');
        expect(parseTaskTitle('Звонок по решению').name).toBe('');
    });

    it('заголовок без структуры разбирается прежним стрипом', () => {
        // Чужая/роботная задача: секций нет, типовое слово убираем как раньше.
        expect(parseTaskTitle('Звонок клиенту про КП').name).toBe(
            'клиенту про КП',
        );
    });
});

describe('parseTaskTitle — «Доработка» только первым словом', () => {
    it('«Доработка» в свободном тексте плана НЕ меняет тип', () => {
        expect(parseTaskTitle('Звонок  Доработка сметы').eventType).toBe(
            'warm',
        );
        expect(parseTaskTitle('Презентация  Доработка макета').eventType).toBe(
            'presentation',
        );
    });
});
