import { BitrixBaseApi } from '../../core/base/bitrix-base-api';
import { BxTasksRepository } from './bx-tasks.repository';
import {
    BXTaskRequestFields,
    IBXTaskCreateFields,
    ITaskCommentGetListRequest,
} from './bx-tasks.interface';

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

    add(fields: IBXTaskCreateFields) {
        return this.repo.add(fields);
    }

    complete(taskId: number | string) {
        return this.repo.complete(taskId);
    }

    /** Комментарии задачи (`task.commentitem.getlist`) — страница до 50. */
    commentGetList(data: ITaskCommentGetListRequest) {
        return this.repo.commentGetList(data);
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
