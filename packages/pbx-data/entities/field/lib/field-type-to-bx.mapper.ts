import { EUserFieldType } from '../../../../nest-api/src/generated/model/eUserFieldType';
import { PbxSalesEventFieldType } from '../type/sales/event/pbx-sales-event-field.type';
import { PbxSalesKonstructorFieldType } from '../type/sales/konstructor/pbx-sales-konstructor-field.type';

type PortalFieldType = PbxSalesEventFieldType | PbxSalesKonstructorFieldType;
export const mapFieldTypeToBitrixType = (
    type: PortalFieldType,
): EUserFieldType => {
    const typeMap: Record<PortalFieldType, EUserFieldType> = {
        string: EUserFieldType.string,
        integer: EUserFieldType.integer,
        // double: EUserFieldType.double,
        datetime: EUserFieldType.datetime,
        date: EUserFieldType.date,
        boolean: EUserFieldType.boolean,
        enumeration: EUserFieldType.enumeration,
        employee: EUserFieldType.employee,
        crm: EUserFieldType.crm,
        multiple: EUserFieldType.string,
        money: EUserFieldType.money,
    };
    return typeMap[type] ?? EUserFieldType.string;
};
