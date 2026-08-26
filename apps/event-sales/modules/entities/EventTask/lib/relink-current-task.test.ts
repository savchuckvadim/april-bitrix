import { describe, expect, it } from 'vitest';
import {
    resolveCurrentTaskRelink,
    resolveCurrentTaskSource,
} from './relink-current-task';
import type { EventTask } from '../types/event-task-type';

const task = (id: number | string): EventTask =>
    ({ id, name: 'Дело' }) as unknown as EventTask;

describe('resolveCurrentTaskRelink', () => {
    it('без текущей задачи перепривязывать нечего (обычный бут списка)', () => {
        expect(resolveCurrentTaskRelink(null, [task(1)])).toBeNull();
    });

    it('без свежего списка не перепривязывает', () => {
        expect(resolveCurrentTaskRelink(task(1), null)).toBeNull();
        expect(resolveCurrentTaskRelink(task(1), [])).toBeNull();
    });

    it('возвращает одноимённую по id задачу из свежего списка', () => {
        const stale = task(12);
        const fresh = task(12);
        expect(resolveCurrentTaskRelink(stale, [task(3), fresh])).toBe(fresh);
    });

    it('id сверяются с приведением типов (строка из legacy против числа)', () => {
        const fresh = task(12);
        expect(resolveCurrentTaskRelink(task('12'), [fresh])).toBe(fresh);
    });

    it('current уже из свежего списка — повторная перепривязка не нужна', () => {
        const current = task(12);
        expect(resolveCurrentTaskRelink(current, [current])).toBeNull();
    });

    it('задача пропала из списка — оставляем как есть (форму не выдёргиваем)', () => {
        expect(resolveCurrentTaskRelink(task(12), [task(3)])).toBeNull();
    });
});

describe('resolveCurrentTaskSource', () => {
    it('без текущей задачи восстанавливать нечего (обычный бут списка)', () => {
        expect(resolveCurrentTaskSource(null, [task(1)])).toBeNull();
    });

    it('свежая задача главнее прежней: контакт/лид — из актуальных привязок', () => {
        const stale = task(12);
        const fresh = task(12);
        expect(resolveCurrentTaskSource(stale, [task(3), fresh])).toBe(fresh);
    });

    it('задача пропала из свежего списка — источником остаётся ПРЕЖНЯЯ current', () => {
        const stale = task(12);
        expect(resolveCurrentTaskSource(stale, [task(3)])).toBe(stale);
    });

    it('списка нет вовсе (reload без задач) — тоже прежняя current', () => {
        const stale = task(12);
        expect(resolveCurrentTaskSource(stale, null)).toBe(stale);
        expect(resolveCurrentTaskSource(stale, [])).toBe(stale);
    });
});
