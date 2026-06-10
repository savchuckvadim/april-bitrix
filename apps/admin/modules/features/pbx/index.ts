export * from './deal-fields';
export * from './smart-fields';
export * from './rq-fields';
export * from './pbx-smart-install';
// deal-fields and smart-fields export an identical `EntityFieldsContext` type;
// re-export one explicitly to resolve the star-export ambiguity.
export type { EntityFieldsContext } from './deal-fields';
