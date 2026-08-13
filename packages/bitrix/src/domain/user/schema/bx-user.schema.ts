import { EBxMethod } from '../../../core';
import { IBXUser } from '../../interfaces/bitrix.interface';

/**
 * `user.get` — фильтр и select, ответ списком.
 *
 * Метод живёт без неймспейса (`user.get`, не `crm.user.get`), поэтому и в
 * карте схем он лежит в WITHOUT_NAMESPACE.
 */
export type BxUserSchema = {
    [EBxMethod.GET]: {
        request: {
            filter?: Partial<IBXUser> | Record<string, unknown>;
            select?: string[];
        };
        response: IBXUser[];
    };
};
