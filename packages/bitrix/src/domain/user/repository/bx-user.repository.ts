import { BitrixBaseApi } from '../../../core';
import {
    EBxMethod,
    EBxNamespace,
} from '../../../core/domain/consts/bitrix-api.enum';
import { EBXEntity } from '../../../core/domain/consts/bitrix-entities.enum';
import { IBXUser } from '../../interfaces/bitrix.interface';

/**
 * Сотрудники портала (`user.get`) — без CRM-неймспейса.
 *
 * Зеркало back/libs/bitrix/src/domain/user: там же берутся фильтр, select и
 * порядок. Во фронте нужен минимум — достать имена по id.
 */
export class BxUserRepository {
    constructor(private readonly bxApi: BitrixBaseApi) {}

    async get(
        filter: Partial<IBXUser> | Record<string, unknown>,
        select?: string[],
    ) {
        return this.bxApi.callType(
            EBxNamespace.WITHOUT_NAMESPACE,
            EBXEntity.USER,
            EBxMethod.GET,
            { filter, select },
        );
    }

    getBtch(
        cmdCode: string,
        filter: Partial<IBXUser> | Record<string, unknown>,
        select?: string[],
    ) {
        return this.bxApi.addCmdBatchType(
            cmdCode,
            EBxNamespace.WITHOUT_NAMESPACE,
            EBXEntity.USER,
            EBxMethod.GET,
            { filter, select },
        );
    }
}
