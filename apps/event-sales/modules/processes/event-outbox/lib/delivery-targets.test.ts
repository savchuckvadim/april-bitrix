import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
    sendFlow: vi.fn(),
}));

vi.mock('@/modules/processes/event/lib/api/flow-helper', () => ({
    FlowHelper: class {
        sendFlow = h.sendFlow;
    },
}));

import type { DirectDeliveryOutcome } from './direct-delivery';
import {
    DIRECT_BITRIX_TARGET_ID,
    PRIMARY_BACKEND_TARGET_ID,
    classifyFlowSendError,
    createDirectBitrixTarget,
    directBitrixTarget,
    getDeliveryTargets,
    isDirectFirstPlacement,
    primaryBackendTarget,
} from './delivery-targets';
import { OUTBOX_DELIVERY_OUTCOME } from './outbox-envelope';
import { makeEnvelope } from './outbox-test-kit';

/**
 * Реестр адресов: primary-backend + прямой исполнитель direct-bitrix (А4);
 * классификация ошибок POST (4xx → rejected, 5xx/сеть → network-error) и
 * маппинг исходов прямого исполнителя на исходы цели.
 */

beforeEach(() => {
    h.sendFlow.mockReset();
});

const axiosError = (status: number | null) => {
    const error = new Error(`ошибка ${status ?? 'сети'}`) as Error & {
        isAxiosError: boolean;
        response?: { status: number };
    };

    error.isAxiosError = true;
    if (status !== null) {
        error.response = { status };
    }

    return error;
};

describe('classifyFlowSendError', () => {
    it('4xx — rejected (валидация, авторетраи запрещены)', () => {
        expect(classifyFlowSendError(axiosError(400))).toMatchObject({
            outcome: 'rejected',
            detail: expect.stringContaining('HTTP 400'),
        });
        expect(classifyFlowSendError(axiosError(422)).outcome).toBe('rejected');
    });

    it('5xx — server-error: сервер ОТВЕТИЛ, запрос мог долететь (MINOR-1)', () => {
        // Бэк пишет статус операции и ставит job ДО исполнения flow, поэтому
        // 504 прокси означает «апстрим принял». Повтор через primary
        // безопасен (идемпотентность), а прямой путь по такому конверту
        // запрещён — иначе воркер исполнит flow вторым.
        expect(classifyFlowSendError(axiosError(503))).toMatchObject({
            outcome: 'server-error',
            detail: expect.stringContaining('HTTP 503'),
        });
        expect(classifyFlowSendError(axiosError(504)).outcome).toBe(
            'server-error',
        );
    });

    it('сеть/таймаут БЕЗ ответа — network-error (молчание сервера)', () => {
        expect(classifyFlowSendError(axiosError(null)).outcome).toBe(
            'network-error',
        );
    });

    it('resultCode=ERROR при HTTP 200 (обёртка customAxios) — rejected', () => {
        expect(classifyFlowSendError(new Error('Backend error /flow'))).toEqual(
            {
                outcome: 'rejected',
                detail: 'Backend error /flow',
            },
        );
    });
});

describe('primaryBackendTarget', () => {
    it('2xx: accepted + статус операции из ответа', async () => {
        h.sendFlow.mockResolvedValue({
            operationId: 'op-1',
            status: 'queued',
            queuedAt: 'x',
        });

        const envelope = makeEnvelope();
        const result = await primaryBackendTarget.deliver(envelope);

        expect(h.sendFlow).toHaveBeenCalledWith(envelope.payload);
        expect(result).toMatchObject({
            outcome: 'accepted',
            operationStatus: 'queued',
        });
    });

    it('повторный POST завершённой операции несёт её error как detail', async () => {
        h.sendFlow.mockResolvedValue({
            operationId: 'op-1',
            status: 'failed',
            queuedAt: 'x',
            error: 'нет стадии',
        });

        const result = await primaryBackendTarget.deliver(makeEnvelope());

        expect(result).toMatchObject({
            outcome: 'accepted',
            operationStatus: 'failed',
            detail: 'нет стадии',
        });
    });

    it('падение POST классифицируется, не бросает', async () => {
        h.sendFlow.mockRejectedValue(axiosError(null));

        const result = await primaryBackendTarget.deliver(makeEnvelope());

        expect(result.outcome).toBe('network-error');
    });
});

describe('реестр целей', () => {
    it('primary первый, за ним прямой исполнитель direct-bitrix (А4)', () => {
        expect(getDeliveryTargets().map(t => t.id)).toEqual([
            PRIMARY_BACKEND_TARGET_ID,
            DIRECT_BITRIX_TARGET_ID,
        ]);
    });

    it('без исполнителя (реестр вне Redux-конвейера) direct-bitrix отвечает unavailable', async () => {
        expect(directBitrixTarget.id).toBe(DIRECT_BITRIX_TARGET_ID);
        await expect(
            directBitrixTarget.deliver(makeEnvelope()),
        ).resolves.toMatchObject({ outcome: 'unavailable' });
        // реестр без контекста — та же неподключённая цель
        const unwired = getDeliveryTargets()[1]!;

        await expect(unwired.deliver(makeEnvelope())).resolves.toMatchObject({
            outcome: 'unavailable',
        });
    });

    it('с исполнителем в контексте реестр отдаёт подключённую цель', async () => {
        const runDirect = async (): Promise<DirectDeliveryOutcome> => ({
            status: 'executed',
            executedDirect: true,
            deferred: [],
            addedTaskId: null,
            portalSnapshotAt: null,
        });
        const wired = getDeliveryTargets({ deliverDirect: runDirect })[1]!;

        await expect(wired.deliver(makeEnvelope())).resolves.toMatchObject({
            outcome: OUTBOX_DELIVERY_OUTCOME.executedDirect,
        });
    });
});

describe('createDirectBitrixTarget — маппинг исходов исполнителя', () => {
    const deliverWith = (outcome: DirectDeliveryOutcome) =>
        createDirectBitrixTarget(async () => outcome).deliver(makeEnvelope());

    it('refused (допуск не пройден) → unavailable: попытка не пишется, конверт ждёт primary', async () => {
        await expect(
            deliverWith({
                status: 'refused',
                reason: 'backend-alive',
                detail: 'status: not-found',
            }),
        ).resolves.toEqual({
            outcome: OUTBOX_DELIVERY_OUTCOME.unavailable,
            detail: 'допуск прямого пути: backend-alive (status: not-found)',
        });
        await expect(
            deliverWith({ status: 'refused', reason: 'no-marker-task' }),
        ).resolves.toEqual({
            outcome: OUTBOX_DELIVERY_OUTCOME.unavailable,
            detail: 'допуск прямого пути: no-marker-task',
        });
    });

    it('executed → executed-direct с хвостом deferred и свежестью слепка', async () => {
        await expect(
            deliverWith({
                status: 'executed',
                executedDirect: true,
                deferred: [{ kind: 'kpi' }, { kind: 'pres-deals' }],
                addedTaskId: 555,
                portalSnapshotAt: 42_000,
            }),
        ).resolves.toEqual({
            outcome: OUTBOX_DELIVERY_OUTCOME.executedDirect,
            direct: {
                deferred: [{ kind: 'kpi' }, { kind: 'pres-deals' }],
                portalSnapshotAt: 42_000,
            },
        });
    });

    it('duplicate-marker → executed-direct: хвост из конверта, без повторного исполнения', async () => {
        await expect(
            deliverWith({
                status: 'duplicate-marker',
                executedDirect: true,
                deferred: [{ kind: 'transfer-notify' }],
            }),
        ).resolves.toEqual({
            outcome: OUTBOX_DELIVERY_OUTCOME.executedDirect,
            detail: 'duplicate-marker: исполнено напрямую ранее',
            direct: {
                deferred: [{ kind: 'transfer-notify' }],
                portalSnapshotAt: null,
            },
        });
    });

    it('incomplete → direct-incomplete: состав упавших команд и хвост едут в конверт', async () => {
        await expect(
            deliverWith({
                status: 'incomplete',
                executedDirect: true,
                failedCommands: ['complete_task_9'],
                detail: 'обязательные команды пишущего батча не применились',
                deferred: [{ kind: 'kpi' }],
                addedTaskId: null,
                portalSnapshotAt: 2_500,
                directAttempted: { at: 100, markerTaskId: 9 },
            }),
        ).resolves.toEqual({
            outcome: OUTBOX_DELIVERY_OUTCOME.directIncomplete,
            detail: 'обязательные команды пишущего батча не применились',
            directAttempted: { at: 100, markerTaskId: 9 },
            directIncomplete: {
                failedCommands: ['complete_task_9'],
                deferred: [{ kind: 'kpi' }],
                portalSnapshotAt: 2_500,
            },
        });
    });

    it('failed → network-error: конверт останется failed-ретраебельным для дренажа', async () => {
        await expect(
            deliverWith({
                status: 'failed',
                detail: 'обязательные команды пишущего батча упали',
            }),
        ).resolves.toEqual({
            outcome: OUTBOX_DELIVERY_OUTCOME.networkError,
            detail: 'обязательные команды пишущего батча упали',
        });
    });
});

describe('канарейка А5.5: порядок целей по встройке', () => {
    // Вкладка карточки — самая узкая встройка: там менеджер отчитывается по
    // одному событию, поэтому прямой путь обкатывается именно на ней.
    it('вкладка карточки ставит прямой путь первым', () => {
        const targets = getDeliveryTargets({
            placement: 'CRM_DEAL_DETAIL_TAB',
        });

        expect(targets.map(target => target.id)).toEqual([
            DIRECT_BITRIX_TARGET_ID,
            PRIMARY_BACKEND_TARGET_ID,
        ]);
    });

    it('остальные встройки идут прежним порядком: сервер, затем прямой путь', () => {
        for (const placement of [
            'CRM_DEAL_DETAIL_ACTIVITY',
            'TASK_VIEW_TAB',
            null,
            undefined,
        ]) {
            const targets = getDeliveryTargets({ placement });

            expect(targets.map(target => target.id)).toEqual([
                PRIMARY_BACKEND_TARGET_ID,
                DIRECT_BITRIX_TARGET_ID,
            ]);
        }
    });

    it('признак встройки узнаёт вкладку любой сущности', () => {
        expect(isDirectFirstPlacement('CRM_COMPANY_DETAIL_TAB')).toBe(true);
        expect(isDirectFirstPlacement('CRM_LEAD_DETAIL_TAB')).toBe(true);
        expect(isDirectFirstPlacement('CRM_DEAL_DETAIL_ACTIVITY')).toBe(false);
        expect(isDirectFirstPlacement(null)).toBe(false);
    });
});
