import { vi } from 'vitest';
import type { BitrixBaseApi } from '../../core/base/bitrix-base-api';

/** Запись одного обращения репозитория к BitrixBaseApi. */
export interface RecordedBxCall {
    kind: 'call' | 'batch';
    /** cmd-ключ — только у batch-накопления. */
    cmd?: string;
    namespace: string;
    entity: string;
    method: string;
    data: unknown;
}

/**
 * Фейк BitrixBaseApi для юнит-тестов репозиториев/сервисов: пишет
 * (namespace, entity, method, data) каждого callType/addCmdBatchType —
 * тесты сверяют строковые значения enum'ов, из которых base-api собирает
 * имя REST-метода `${namespace}.${entity}.${method}`. Сама сборка строки
 * проверяется отдельно на живом классе
 * (core/base/__tests__/bitrix-base-api-batch.spec.ts).
 */
export const createFakeBxApi = (callResponse: unknown = { result: null }) => {
    const calls: RecordedBxCall[] = [];

    const callType = vi.fn(
        async (
            namespace: string,
            entity: string,
            method: string,
            data: unknown,
        ) => {
            calls.push({ kind: 'call', namespace, entity, method, data });
            return callResponse;
        },
    );
    const addCmdBatchType = vi.fn(
        (
            cmd: string,
            namespace: string,
            entity: string,
            method: string,
            data: unknown,
        ) => {
            calls.push({ kind: 'batch', cmd, namespace, entity, method, data });
        },
    );

    return {
        api: { callType, addCmdBatchType } as unknown as BitrixBaseApi,
        calls,
        callType,
        addCmdBatchType,
    };
};
