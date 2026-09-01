import type { UnknownAction } from '@reduxjs/toolkit';

import { resetKvStorage } from '@workspace/api';
import {
    createFakeIndexedDb,
    createFakeLocalStorage,
} from '@workspace/api/src/services/kv-storage/__tests__/fake-storage';

import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import type { EvFlowDto } from '@/modules/processes/event/model';

import type {
    DeliveryTarget,
    DeliveryTargetResult,
    FlowStatusCheck,
} from './delivery-targets';
import { createOutboxEnvelope, type OutboxEnvelope } from './outbox-envelope';
import type { OutboxLockManager } from './outbox-lock';

/**
 * Инструментарий ТОЛЬКО для тестов outbox: фейковое окно с KV-хранилищем
 * (реальная цепочка kv-storage поверх фейкового IndexedDB), фабрики
 * конвертов и целей, мини-«стор» для прогона thunk'ов. В barrel слайса не
 * экспортируется и в прод-коде не используется.
 */

/** Смонтировать фейковое окно и сбросить выбор хранилища. */
export const mountKvWindow = (win: Record<string, unknown> | null): void => {
    if (win) {
        (globalThis as Record<string, unknown>).window = win;
    } else {
        delete (globalThis as Record<string, unknown>).window;
    }

    resetKvStorage();
};

/** Обычная среда тестов: рабочий фейковый IndexedDB + localStorage. */
export const mountDefaultKvWindow = (): void => {
    mountKvWindow({
        indexedDB: createFakeIndexedDb(),
        localStorage: createFakeLocalStorage(),
    });
};

export const TEST_DOMAIN = 'test.bitrix24.ru';

let operationSeq = 0;

/** Конверт для тестов: валидный v1 c минимальным payload. */
export const makeEnvelope = (
    overrides: Partial<OutboxEnvelope> = {},
): OutboxEnvelope => {
    operationSeq += 1;

    return {
        ...createOutboxEnvelope({
            operationId: `op-${operationSeq}`,
            domain: TEST_DOMAIN,
            userId: 7,
            kind: 'report',
            payload: {
                domain: TEST_DOMAIN,
                presentation: {},
            } as unknown as EvFlowDto,
            now: 1_000,
        }),
        ...overrides,
    };
};

export interface FakeTargetCall {
    operationId: string;
    at: number;
}

/**
 * Фейковая цель доставки: отвечает по сценарию (по одному исходу на вызов,
 * последний повторяется) и записывает вызовы в общий журнал `events`.
 * `checkStatus` появляется у цели, только если передан его сценарий —
 * как у настоящих целей, где сверкой статуса владеет один primary.
 */
export const makeTarget = (
    script: DeliveryTargetResult[],
    options: {
        id?: string;
        events?: string[];
        checkStatus?: FlowStatusCheck[];
    } = {},
): DeliveryTarget & { calls: FakeTargetCall[]; checkCalls: string[] } => {
    const calls: FakeTargetCall[] = [];
    const checkCalls: string[] = [];
    let index = 0;
    let checkIndex = 0;
    const checkScript = options.checkStatus;

    return {
        id: options.id ?? 'fake-target',
        calls,
        checkCalls,
        deliver: async envelope => {
            calls.push({ operationId: envelope.operationId, at: Date.now() });
            options.events?.push(`deliver:${envelope.operationId}`);
            const result = script[Math.min(index, script.length - 1)]!;

            index += 1;

            return result;
        },
        ...(checkScript
            ? {
                  checkStatus: async (operationId: string) => {
                      checkCalls.push(operationId);
                      options.events?.push(`check:${operationId}`);
                      const result =
                          checkScript[
                              Math.min(checkIndex, checkScript.length - 1)
                          ]!;

                      checkIndex += 1;

                      return result;
                  },
              }
            : {}),
    };
};

/**
 * Управляемое время для двигателя доставки: `now` читает счётчик, `wait` не
 * ждёт по-настоящему — записывает паузу и продвигает счётчик на неё (иначе
 * ре-чек nextAttemptAt в цикле бэкоффа честно отказал бы в ретрае).
 */
export const makeClock = (start = 100_000) => {
    const delays: number[] = [];
    const clock = { value: start };

    return {
        delays,
        clock,
        now: () => clock.value,
        wait: async (ms: number): Promise<void> => {
            delays.push(ms);
            clock.value += ms;
        },
    };
};

/**
 * Фейковый Web Locks: честный `ifAvailable` — занятое имя отдаёт null.
 * Один экземпляр делят «вкладки» теста, как настоящий менеджер — origin.
 */
export const makeFakeLockManager = (): OutboxLockManager & {
    held: Set<string>;
} => {
    const held = new Set<string>();

    return {
        held,
        request: async (name, _options, task) => {
            if (held.has(name)) {
                return task(null);
            }
            held.add(name);
            try {
                return await task({ name });
            } finally {
                held.delete(name);
            }
        },
    };
};

/**
 * Мини-«стор» для thunk'ов: dispatch исполняет вложенные thunk'и, обычные
 * экшены складывает в журнал; getState отдаёт только то, что thunk'и outbox
 * реально читают (`app.domain`).
 */
export const makeThunkHarness = (domain: string = TEST_DOMAIN) => {
    const actions: UnknownAction[] = [];
    const getState = (() =>
        ({ app: { domain } }) as never) as unknown as AppGetState;
    const dispatch = ((action: unknown) => {
        if (typeof action === 'function') {
            return (action as (d: AppDispatch, g: AppGetState) => unknown)(
                dispatch,
                getState,
            );
        }
        actions.push(action as UnknownAction);

        return action;
    }) as AppDispatch;

    return { dispatch, getState, actions };
};
