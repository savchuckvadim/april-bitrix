import { describe, expect, it } from 'vitest';
import type { PBXFieldItem } from '@/modules/app/types/portal/portal-type';
import {
    getProspectCaption,
    getProspectName,
    getProspectSteps,
} from './prospect-scale-view';

const item = (code: string, name: string): PBXFieldItem =>
    ({ code, name }) as PBXFieldItem;

const PORTAL_ITEMS = [
    item('red', 'Холодный'),
    item('green', 'Горячий'),
    // жёлтого на портале нет — подпись возьмётся из локальной шкалы
];

describe('getProspectSteps', () => {
    it('держит порядок шкалы и цвета-токены независимо от портала', () => {
        const steps = getProspectSteps(PORTAL_ITEMS);
        expect(steps.map(step => step.code)).toEqual([
            'red',
            'yellow',
            'green',
        ]);
        expect(steps.map(step => step.color)).toEqual([
            'var(--destructive)',
            'var(--warning)',
            'var(--success)',
        ]);
    });

    it('подписи — портальные, а без них локальные', () => {
        expect(getProspectSteps(PORTAL_ITEMS).map(step => step.label)).toEqual([
            'Холодный',
            'Жёлтый',
            'Горячий',
        ]);
        expect(getProspectSteps(null).map(step => step.label)).toEqual([
            'Красный',
            'Жёлтый',
            'Зелёный',
        ]);
    });
});

describe('getProspectName', () => {
    it('пустой код — пустая строка', () => {
        expect(getProspectName(PORTAL_ITEMS, null)).toBe('');
        expect(getProspectName(PORTAL_ITEMS, undefined)).toBe('');
    });

    it('неизвестный код не выдумывает названия', () => {
        expect(getProspectName(PORTAL_ITEMS, 'violet')).toBe('');
    });
});

describe('getProspectCaption', () => {
    it('без значения — честное «не задан»', () => {
        expect(getProspectCaption({})).toBe('Прогноз не задан');
    });

    it('показывает текущее значение', () => {
        expect(getProspectCaption({ currentName: 'Зелёный' })).toBe(
            'Сейчас: Зелёный',
        );
    });

    it('под курсором показывает и текущее, и будущее', () => {
        expect(
            getProspectCaption({
                currentName: 'Зелёный',
                previewName: 'Красный',
            }),
        ).toBe('Сейчас: Зелёный → Красный');
    });

    it('наведение на уже выбранное ничего не добавляет', () => {
        expect(
            getProspectCaption({
                currentName: 'Зелёный',
                previewName: 'Зелёный',
            }),
        ).toBe('Сейчас: Зелёный');
    });

    it('ошибка записи сильнее любой подписи', () => {
        expect(
            getProspectCaption({
                error: 'Не удалось сохранить',
                currentName: 'Зелёный',
                previewName: 'Красный',
            }),
        ).toBe('Не удалось сохранить');
    });
});
