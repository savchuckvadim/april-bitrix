import { BitrixBaseApi } from '../../../core';
import { IBXUser } from '../../interfaces/bitrix.interface';
import { BxUserRepository } from '../repository/bx-user.repository';

/** Что нужно, чтобы назвать человека по имени, и ничего лишнего. */
export const BX_USER_NAME_SELECT = [
    'ID',
    'NAME',
    'LAST_NAME',
    'SECOND_NAME',
    'WORK_POSITION',
    'UF_DEPARTMENT',
];

export class BxUserService {
    private repo!: BxUserRepository;

    clone(api: BitrixBaseApi): BxUserService {
        const instance = new BxUserService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxUserRepository(api);
    }

    get(filter: Partial<IBXUser> | Record<string, unknown>, select?: string[]) {
        return this.repo.get(filter, select);
    }

    /**
     * Сотрудники по id одним запросом.
     *
     * Ровно для случая «в истории написано „Сотрудник 447“»: человек может
     * работать вне отдела продаж, и в загруженной структуре отдела его нет.
     */
    async getByIds(ids: Array<number | string>, select = BX_USER_NAME_SELECT) {
        const unique = [...new Set(ids.map(Number))].filter(
            id => Number.isFinite(id) && id > 0,
        );
        if (!unique.length) return [] as IBXUser[];

        const response = await this.repo.get({ ID: unique }, select);
        return (response?.result ?? []) as unknown as IBXUser[];
    }
}
