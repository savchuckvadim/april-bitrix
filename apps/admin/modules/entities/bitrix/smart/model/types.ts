import type {
    IBXSmartType,
    IBXSmartFullType,
    IBXFullCategory,
    IBXStatus,
    } from '@workspace/bitrix';

/**
 * Local type aliases for Bitrix live-data types.
 * Keeps imports in the app stable if the package renames these types.
 */
export type BxSmartType = IBXSmartType;
export type BxSmartFullType = IBXSmartFullType;
export type BxSmartCategory = IBXFullCategory;
export type BxSmartStage = IBXStatus
/**
 * A Bitrix stage (status) as returned by crm.status.list.
 * The interface in the bitrix package is minimal — extended here for convenience.
 */
//  {
//     STATUS_ID: string;
//     NAME: string;
//     /** 'S' = success, 'F' = failure, '' = normal */
//     SEMANTICS?: string;
//     SORT?: string | number;
//     ENTITY_ID?: string;
//     CATEGORY_ID?: string | number;
//     COLOR?: string;
// }
