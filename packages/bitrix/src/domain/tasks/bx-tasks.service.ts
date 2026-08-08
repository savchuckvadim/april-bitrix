import { BitrixBaseApi } from '../../core/base/bitrix-base-api';
import { BxTasksRepository } from './bx-tasks.repository';
import { BXTaskRequestFields } from './bx-tasks.interface';

export class BxTasksService {
    private repo!: BxTasksRepository;

    clone(api: BitrixBaseApi): BxTasksService {
        const instance = new BxTasksService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxTasksRepository(api);
    }

    get(taskId: number | string, select?: string[]) {
        return this.repo.get(taskId, select);
    }

    getList(filter: Partial<BXTaskRequestFields>, select?: string[]) {
        return this.repo.getList(filter, select);
    }

    getAll(filter: Partial<BXTaskRequestFields>, select?: string[]) {
        return this.repo.getAll(filter, select);
    }

    update(taskId: number | string, fields: { [key: string]: unknown }) {
        return this.repo.update(taskId, fields);
    }

    delete(taskId: number) {
        return this.repo.delete(taskId);
    }
}
