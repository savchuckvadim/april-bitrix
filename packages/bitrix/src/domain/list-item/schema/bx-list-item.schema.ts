import { EBxMethod } from '../../../core/domain/consts/bitrix-api.enum';
import {
    IBXListItem,
    IBXListItemFields,
} from '../interface/bx-list-item.interface';

/**
 * Параметры `lists.element.get`. Ключи фильтра/селекта — в нижнем регистре,
 * как в back-эталоне (боевой у kpi-report-sales/event-service): Bitrix
 * принимает оба регистра, держим один.
 */
export type BxListItemGetRequestType = {
    IBLOCK_TYPE_ID: 'lists';
    IBLOCK_CODE?: string;
    IBLOCK_ID?: string | number;
    ELEMENT_ID?: string | number;
    ELEMENT_CODE?: string;
    filter?: Record<string, unknown>;
    select?: string[];
    order?: Record<string, 'ASC' | 'DESC'>;
    /** Стандартная постраничность Bitrix (страница = 50 элементов). */
    start?: number;
};

export type BxListItemAddRequestType = {
    IBLOCK_TYPE_ID: 'lists';
    IBLOCK_ID: string | number;
    ELEMENT_CODE?: string;
    FIELDS: IBXListItemFields;
};

export type BxListItemSchema = {
    [EBxMethod.GET]: {
        request: BxListItemGetRequestType;
        response: IBXListItem[];
    };
    [EBxMethod.ADD]: {
        request: BxListItemAddRequestType;
        response: number;
    };
};
