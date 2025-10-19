import { IBxRpaItem } from '../interface/bx-rpa-item.interface';

export class GetRpaItemDto {
    id!: number;
    typeId!: number;
}

export class AddRpaItemDto {
    typeId?: number;
    fields!: Partial<IBxRpaItem>;
}

export class UpdateRpaItemDto {
    id!: number;
    typeId!: number;
    fields!: Partial<IBxRpaItem>;
}

export class ListRpaItemDto {
    id?: number;
    typeId?: number;
    filter?: Partial<IBxRpaItem>;
    order?: string[];
}
