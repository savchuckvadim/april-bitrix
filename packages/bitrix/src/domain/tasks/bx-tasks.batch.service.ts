import { BitrixBaseApi } from '../../core/base/bitrix-base-api';
import { BxTasksRepository } from './bx-tasks.repository';
import {
    BXTaskRequestFields,
    IBXTaskCreateFields,
    ITaskCommentAddFields,
} from './bx-tasks.interface';

export class BxTasksBatchService {
    private repo!: BxTasksRepository;

    clone(api: BitrixBaseApi): BxTasksBatchService {
        const instance = new BxTasksBatchService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxTasksRepository(api);
    }

    add(cmdCode: string, fields: IBXTaskCreateFields) {
        return this.repo.addBtch(cmdCode, fields);
    }

    complete(cmdCode: string, taskId: number | string) {
        return this.repo.completeBtch(cmdCode, taskId);
    }

    /** Комментарий к задаче (`task.commentitem.add`). */
    commentAdd(
        cmdCode: string,
        taskId: number | string,
        fields: ITaskCommentAddFields,
    ) {
        return this.repo.commentAddBtch(cmdCode, taskId, fields);
    }

    get(cmdCode: string, taskId: number | string, select?: string[]) {
        return this.repo.getBtch(cmdCode, taskId, select);
    }

    getList(
        cmdCode: string,
        filter: Partial<BXTaskRequestFields>,
        select?: string[],
    ) {
        return this.repo.getListBtch(cmdCode, filter, select);
    }

    update(
        cmdCode: string,
        taskId: number | string,
        fields: { [key: string]: unknown },
    ) {
        return this.repo.updateBtch(cmdCode, taskId, fields);
    }

    delete(cmdCode: string, taskId: number | string) {
        return this.repo.deleteBtch(cmdCode, taskId);
    }
}
