import { describe, expect, it } from 'vitest';
import { AI_CHECKLIST_TEXT } from '../ai-setup-checklist.texts';
import {
    AI_CHECKLIST_ACTION,
    AI_CHECKLIST_ITEM,
    AI_CHECKLIST_SECTION,
    AI_CHECKLIST_STATUS,
    AI_CHECKLIST_VERDICT,
} from '../ai-setup-checklist.types';
import {
    aiChecklistVerdict,
    buildAiChecklistItems,
    buildAiSetupChecklist,
} from '../ai-setup-checklist.util';
import {
    callReport,
    checklistInput,
    findItem,
    readiness,
    settings,
} from './ai-setup-checklist.fixtures';

/*
 * Чек-лист целиком на сценариях портала: всё готово, обзор 403 / ещё не
 * пришёл, разбор выключен, ждём модель, калибровка, нет прав настройки.
 */

describe('buildAiSetupChecklist — сценарии портала', () => {
    it('всё настроено и накоплено — ready, открытых пунктов нет', () => {
        const checklist = buildAiSetupChecklist(checklistInput());
        expect(checklist.verdict).toBe(AI_CHECKLIST_VERDICT.READY);
        expect(checklist.headline).toBe(AI_CHECKLIST_TEXT.headline.ready);
        expect(checklist.sections.map(section => section.key)).toEqual([
            AI_CHECKLIST_SECTION.DONE,
        ]);
    });

    it('обзор 403 (как менеджер): data, пункты обзора — «не проверить», не «готово»', () => {
        const items = buildAiChecklistItems(
            checklistInput({
                overview: null,
                overviewError: 'Request failed with status code 403',
            }),
        );
        expect(findItem(items, AI_CHECKLIST_ITEM.ACCESS)?.status).toBe(
            AI_CHECKLIST_STATUS.TODO,
        );
        for (const code of [
            AI_CHECKLIST_ITEM.NOT_ANALYZED,
            AI_CHECKLIST_ITEM.TENURE,
            AI_CHECKLIST_ITEM.TRENDS,
            AI_CHECKLIST_ITEM.COMPARABLE,
            AI_CHECKLIST_ITEM.YOY,
        ]) {
            const entry = findItem(items, code);
            expect(entry?.status).toBe(AI_CHECKLIST_STATUS.UNKNOWN);
            expect(entry?.detail).toBe(AI_CHECKLIST_TEXT.unknown.forbidden);
        }
        expect(aiChecklistVerdict(items)).toBe(AI_CHECKLIST_VERDICT.DATA);
    });

    it('обзор ещё считается: пункты обзора unknown, доступ не показываем', () => {
        const input = checklistInput({ overview: null });
        const items = buildAiChecklistItems(input);
        expect(findItem(items, AI_CHECKLIST_ITEM.ACCESS)).toBeUndefined();
        expect(findItem(items, AI_CHECKLIST_ITEM.TRENDS)?.detail).toBe(
            AI_CHECKLIST_TEXT.unknown.missing,
        );
        expect(aiChecklistVerdict(items)).toBe(AI_CHECKLIST_VERDICT.READY);
        // Итог честный: не «в полную силу», часть пунктов проверим позже.
        expect(buildAiSetupChecklist(input).headline).toBe(
            AI_CHECKLIST_TEXT.headline.readyUnknown,
        );
    });

    it('калибровка: праздники и состав — «проверим после калибровки», не «настраивать нечего» молча', () => {
        const input = (rosterConfirmedAt: string | null) =>
            checklistInput({
                settings: settings({
                    rosterConfirmedAt,
                    readiness: readiness({
                        mode: 'calibration',
                        historyMonths: 1,
                        reasons: ['history-months-below-3'],
                    }),
                }),
            });
        const gates = findItem(
            buildAiChecklistItems(input(null)),
            AI_CHECKLIST_ITEM.NORMS_GATES,
        );
        expect(gates?.status).toBe(AI_CHECKLIST_STATUS.UNKNOWN);
        expect(gates?.title).toBe('Праздники и состав отдела');
        expect(
            findItem(
                buildAiChecklistItems(input('2026-09-01')),
                AI_CHECKLIST_ITEM.NORMS_GATES,
            )?.title,
        ).toBe('Праздники портала');
        const checklist = buildAiSetupChecklist(input(null));
        expect(checklist.verdict).toBe(AI_CHECKLIST_VERDICT.WAIT);
        expect(checklist.headline).toContain('Сейчас настраивать нечего');
        // В режиме норм пункта нет: причины календаря/состава придут сами.
        expect(
            findItem(
                buildAiChecklistItems(checklistInput()),
                AI_CHECKLIST_ITEM.NORMS_GATES,
            ),
        ).toBeUndefined();
    });

    it('разбор выключен и нет модели: итог data, а не wait', () => {
        const checklist = buildAiSetupChecklist(
            checklistInput({
                settings: settings({
                    callReport: callReport({ enabled: false }),
                    readiness: readiness({ reasons: ['no-portal-model'] }),
                }),
            }),
        );
        expect(checklist.verdict).toBe(AI_CHECKLIST_VERDICT.DATA);
        expect(checklist.headline).toContain(
            AI_CHECKLIST_TEXT.coverage.offTitle,
        );
    });

    it('только ожидание модели: wait с примерной датой 3-го числа (без времени)', () => {
        const checklist = buildAiSetupChecklist(
            checklistInput({
                settings: settings({
                    readiness: readiness({ reasons: ['no-portal-model'] }),
                }),
            }),
        );
        expect(checklist.verdict).toBe(AI_CHECKLIST_VERDICT.WAIT);
        expect(checklist.headline).toContain('(≈ 03.10.2026)');
    });

    it('без прав настройки: кнопки вкладок заменены текстом «кто и где»', () => {
        const items = buildAiChecklistItems(
            checklistInput({
                canConfigure: false,
                settings: settings({
                    readiness: readiness({ reasons: ['roster-not-confirmed'] }),
                }),
            }),
        );
        const roster = findItem(items, AI_CHECKLIST_ITEM.ROSTER);
        expect(roster?.actions).toEqual([
            {
                kind: AI_CHECKLIST_ACTION.TEXT,
                text: 'Руководитель отдела: «Настройки витрины», вкладка «Состав».',
            },
        ]);
    });
});
