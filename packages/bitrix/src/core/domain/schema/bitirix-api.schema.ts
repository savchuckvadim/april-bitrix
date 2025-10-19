import { EBxNamespace } from '../consts/bitrix-api.enum';
import { EBXEntity } from '../consts/bitrix-entities.enum';
import {
    BxCatalogSchema,
    BxListSchema,
    BxRpaItemSchema,

    UserFieldConfigSchema,
} from '../../../domain';
import {
    CompanySchema,
    ContactSchema,
    DealSchema,
    ProductRowSchema,
    FieldsSchema,
    FieldsEnumerationSchema,
    BxCategorySchema,
    BxStatusSchema,
    BxItemSchema,
    TimelineCommentSchema,
} from '../../../domain/crm';

import { TasksSchema } from '../../../domain/tasks/bx-tasks.schema';
import { ActivitySchema } from '../../../domain/activity/bx-activity.schema';
import { FileSchema } from '../../../domain/file/bx-file.schema';
import { BxSmartTypeSchema } from '../../../domain/crm/smart-type';
import { ActivityConfigurableSchema } from '../../../domain/activity-configurable/schema/bx-activity-configurable.schema';


export type BXApiSchema = {
    [EBxNamespace.CRM]: {
        [EBXEntity.DEAL]: DealSchema;
        [EBXEntity.COMPANY]: CompanySchema;
        [EBXEntity.CONTACT]: ContactSchema;
        [EBXEntity.USER_FIELD]: FieldsSchema;
        [EBXEntity.USER_FIELD_ENUMERATION]: FieldsEnumerationSchema;
        [EBXEntity.ACTIVITY]: ActivitySchema;
        [EBXEntity.ACTIVITY_CONFIGURABLE]: ActivityConfigurableSchema;
        [EBXEntity.CATEGORY]: BxCategorySchema;
        [EBXEntity.STATUS]: BxStatusSchema;
        [EBXEntity.ITEM]: BxItemSchema;
        [EBXEntity.TIMELINE_COMMENT]: TimelineCommentSchema;
        [EBXEntity.TYPE]: BxSmartTypeSchema;

        //   [EBxMethod.LIST]: {
        //     request: { filter?: Partial<IBXItem>, select?: string[] };
        //     response: IBXItem[];
        //   };
        //   [EBxMethod.GET]: {
        //     request: CrmItemGetRequestType<string>;
        //     response: IBXItem;
        //   };
        //   [EBxMethod.GET_BY_ENTITY_TYPE_ID]: {
        //     request: { entityTypeId: string };
        //     response: IBXItem;
        //   };
        //   [EBxMethod.ADD]: {
        //     request: CrmItemAddRequestType<IBXItem, string>;
        //     response: IBXItem;
        //   };
        //   [EBxMethod.FIELDS]: {
        //     request: CrmItemListRequestType<string>;
        //     response: IBXItem;
        //   };
        //   [EBxMethod.UPDATE]: {
        //     request: {
        //       id: number | string;

        //       fields: Partial<IBXItem>;
        //     };
        //     response: number;
        //   };
        // }
    };
    [EBxNamespace.RPA]: {
        [EBXEntity.ITEM]: BxRpaItemSchema;
    };
    [EBxNamespace.TASKS]: {
        [EBXEntity.TASK]: TasksSchema;
    };
    [EBxNamespace.CRM_ITEM]: {
        [EBXEntity.PRODUCT_ROW]: ProductRowSchema;

        // {
        //   [EBxMethod.SET]: {
        //     request: Partial<IBXProductRow>;
        //     response: number;
        //   };
        // };
    };
    [EBxNamespace.DISK]: {
        [EBXEntity.FILE]: FileSchema;
    };

    [EBxNamespace.WITHOUT_NAMESPACE]: {
        [EBXEntity.LISTS]: BxListSchema;
        [EBXEntity.USER_FIELD_CONFIG]: UserFieldConfigSchema;
    };
    [EBxNamespace.CATALOG]: {
        [EBXEntity.PRODUCT]: BxCatalogSchema;
    };
};
