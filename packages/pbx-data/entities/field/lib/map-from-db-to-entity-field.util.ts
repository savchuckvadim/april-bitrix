import {
    PbxFieldEntity,
    PbxFieldItem,
    PbxFieldItemEntity,
    PbxFieldWithItems,
} from '../entity/pbx-field.entity';
import { toNumber } from './to-number.util';

export function mapFromDbToEntityField(
    field: PbxFieldWithItems,
): PbxFieldEntity {
    const entity = new PbxFieldEntity();
    entity.name = field.name;
    entity.title = field.title;
    entity.code = field.code;
    entity.type = field.type;
    entity.isPlural = field.isPlural;
    entity.bitrixId = field.bitrixId;
    entity.bitrixCamelId = field.bitrixCamelId;
    entity.entity_id = toNumber(field.entity_id);
    entity.entity_type = field.entity_type;
    entity.parent_type = field.parent_type;
    entity.items =
        field.items?.map(item => mapFromDbToEntityFieldListItem(item)) || [];
    return entity;
}

function mapFromDbToEntityFieldListItem(
    item: PbxFieldItem,
): PbxFieldItemEntity {
    const entity = new PbxFieldItemEntity();
    entity.name = item.name;
    entity.title = item.title;
    entity.code = item.code;
    entity.bitrixfield_id = toNumber(item.bitrixfield_id);
    entity.bitrixId = toNumber(item.bitrixId);
    return entity;
}
