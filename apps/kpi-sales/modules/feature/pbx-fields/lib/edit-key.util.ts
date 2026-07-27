import type { PbxFieldEntity } from '../model';

/**
 * Ключ редактирования «сущность × id × поле» — адресует optimistic-значение
 * и статус сейва в слайсе. Шаблонный тип не даёт собрать ключ руками
 * из произвольных строк.
 */
export type PbxEditKey = `${PbxFieldEntity}:${number}:${string}`;

export const pbxEditKey = (
    entity: PbxFieldEntity,
    entityId: number,
    fieldCode: string,
): PbxEditKey => `${entity}:${entityId}:${fieldCode}`;
