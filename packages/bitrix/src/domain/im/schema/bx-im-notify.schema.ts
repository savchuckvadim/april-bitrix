import { EBxMethod } from '../../../core/domain/consts/bitrix-api.enum';
import {
    IBXImNotifySystemAdd,
    IBXImNotifySystemAddResult,
} from '../interface/bx-im-notify.interface';

/** Схема `im.notify.system.*` (неймспейс `im`, сущность `notify.system`). */
export type BxImNotifySchema = {
    [EBxMethod.ADD]: {
        request: IBXImNotifySystemAdd;
        response: IBXImNotifySystemAddResult;
    };
};
