/**
 * ШИМ вместо back/libs/portal-lib/pbx/const-smart-registry/
 * const-smart-registry.ts: event-type-registry (зеркальный сосед) импортирует
 * отсюда ТОЛЬКО тип ConstSmartKind.
 *
 * TODO(перенос не 1:1, осознанно): полный реестр тянет 4 descriptor-файла
 * смартов (install-поля, BitrixOwnerTypeId, билдеры установки) — это
 * серверная поверхность установщика, изоморфному ядру не нужная. Union ниже
 * обязан совпадать с `kind` дескрипторов CONST_SMART_REGISTRY бэка;
 * разъедется — упадёт typecheck зеркального event-type-registry.ts.
 */
export type ConstSmartKind = 'aicall' | 'skap' | 'zpr' | 'presentation';
