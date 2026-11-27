import { customAxios } from '@workspace/nest-konstructor-api';
import type { InnSetRequest, InnSetResult } from '../../model/types';

const INN_SET_PATH = '/api/konstructor/inn/set';

/**
 * Запись ИНН на бэке конструктора: ЕДИНСТВЕННОЕ место, где слайс client-inn
 * касается api-пакета. Идёт через `customAxios`, как другие ручки, которых
 * ещё нет в orval. Без повторов: запись оставляет след в ленте сделки.
 */
export class InnSetHelper {
    set(request: InnSetRequest): Promise<InnSetResult> {
        return customAxios<InnSetResult>({
            url: INN_SET_PATH,
            method: 'POST',
            data: request,
        });
    }
}
