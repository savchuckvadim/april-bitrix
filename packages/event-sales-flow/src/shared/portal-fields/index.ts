// package-adapted: вырезаны серверные экспорты (LeadUfDefinitionsService, PortalFieldsModule) — в пакете живут только чистые декларации определений и формат crm-значений
export {
    type ILeadUfDefinition,
    type LeadUfDefinitions,
} from './lead-uf-definitions.service';
export {
    buildCrmRefValue,
    parseCrmRefId,
    CRM_REF_ENTITY_TYPES,
    CRM_REF_PREFIX,
    type CrmRefEntityType,
} from './crm-ref-format.util';
