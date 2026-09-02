import { findPortalField } from '@workspace/pbx';
import type { PBXField } from '@/modules/app/types/portal/portal-type';
import {
    CheckPresentationFieldType,
    type CheckPresentationItem,
} from '../type/check-presentation-type';

/** Слепок портала — только то, что нужно вариантам справочников. */
export interface SurveyPortalFields {
    deal?: PBXField[] | null;
    company?: PBXField[] | null;
    lead?: PBXField[] | null;
}

/**
 * Варианты справочников опросника — со слепка портала.
 *
 * Коды вариантов у компании, сделки и лида общие, числовые id — разные;
 * опросник держит КОДЫ, а в id их переводит запись под конкретного
 * носителя (`buildPortalFieldPayload`). Справочник берётся у первого
 * носителя, где поле установлено: сделка точнее компании, лид — когда
 * компании нет. Поля нет нигде — позиция остаётся без вариантов и не
 * рисуется.
 */
export const withPortalOptions = (
    items: CheckPresentationItem[],
    fields: SurveyPortalFields,
): CheckPresentationItem[] =>
    items.map(item => {
        if (item.type !== CheckPresentationFieldType.ENUMERATION) return item;
        const carriers = [fields.deal, fields.company, fields.lead];
        const field = carriers
            .map(carrier => findPortalField(carrier, item.code))
            .find(Boolean);
        if (!field) return item;
        return {
            ...item,
            options: field.items
                .filter(option => option.code)
                .map(option => ({
                    id: String(option.bitrixId),
                    code: option.code,
                    title: option.name,
                })),
        };
    });
