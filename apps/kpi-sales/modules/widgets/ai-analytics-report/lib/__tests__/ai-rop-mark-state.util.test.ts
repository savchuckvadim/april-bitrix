import { describe, expect, it } from 'vitest';
import type { AiRopMarkWeek } from '@/modules/entities/ai-analytics/model';
import {
    AI_ROP_MARK_LOAD_ERROR,
    aiRopMarkCardView,
    aiRopMarkErrorView,
} from '../ai-rop-mark-state.util';

/* Локальная фикстура недели: подбор с одним звонком. */
const week = (overrides: Partial<AiRopMarkWeek> = {}): AiRopMarkWeek => ({
    weekKey: '2026-W38',
    from: '2026-09-14',
    to: '2026-09-20',
    calls: [
        {
            transcriptionId: 't-1',
            managerId: '7',
            reason: 'random',
            reasonTitle: 'Случайный звонок',
            marked: false,
            aiCallType: null,
            aiScore: null,
        },
    ],
    generatedAt: '2026-09-21T01:00:00Z',
    blindNote: 'До сохранения метки оценка AI не отдаётся.',
    ...overrides,
});

describe('aiRopMarkCardView — что показывает карточка', () => {
    it('ошибка важнее данных; без данных — загрузка', () => {
        expect(aiRopMarkCardView('error', week())).toBe('error');
        expect(aiRopMarkCardView('idle', null)).toBe('loading');
        expect(aiRopMarkCardView('loading', null)).toBe('loading');
    });

    it('подбора нет → noPick; подбор без звонков → noCalls; есть звонки → calls', () => {
        expect(
            aiRopMarkCardView('ready', week({ calls: [], generatedAt: '' })),
        ).toBe('noPick');
        expect(aiRopMarkCardView('ready', week({ calls: [] }))).toBe('noCalls');
        expect(aiRopMarkCardView('ready', week())).toBe('calls');
    });

    it('перечитка («Подобрать заново», после метки) — прежние данные на экране', () => {
        expect(aiRopMarkCardView('loading', week({ calls: [] }))).toBe(
            'noCalls',
        );
        expect(aiRopMarkCardView('loading', week())).toBe('calls');
    });
});

describe('aiRopMarkErrorView — ошибка карточки', () => {
    it('403 суперпользователю вендора: текст сервера как есть, без «Повторить»', () => {
        // Текст бэка AI_ROP_MARK_SUPER_USER_FORBIDDEN_MESSAGE.
        const text =
            'Суперпользователь вендора смотрит слепую проверку только на чтение: ставить метки и пересобирать подбор недели могут только руководители портала';
        expect(aiRopMarkErrorView(text)).toEqual({ text, canRetry: false });
    });

    it('типовые отказы доступа тоже без повтора', () => {
        expect(
            aiRopMarkErrorView(
                'Операция доступна только руководителю отдела продаж',
            ).canRetry,
        ).toBe(false);
        expect(
            aiRopMarkErrorView('Request failed with status code 403').canRetry,
        ).toBe(false);
    });

    it('сеть/таймаут — с повтором; пустой текст — запасной', () => {
        expect(aiRopMarkErrorView('Network Error')).toEqual({
            text: 'Network Error',
            canRetry: true,
        });
        expect(aiRopMarkErrorView(null)).toEqual({
            text: AI_ROP_MARK_LOAD_ERROR,
            canRetry: true,
        });
        expect(aiRopMarkErrorView('  ').text).toBe(AI_ROP_MARK_LOAD_ERROR);
    });
});
