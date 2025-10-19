import { IBXItem } from '../../item/interface/item.interface';

export interface IBXSmart<id extends string> extends IBXItem {
    entityTypeId: `${id}`;
}
