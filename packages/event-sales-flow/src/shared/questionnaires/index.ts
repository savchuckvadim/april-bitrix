// Шов пакета: зеркало index бэковой либы store/questionnaires, обрезанное до
// ЧИСТОЙ части — схемы-реестра каталога анкет. Repository/service/module —
// серверные (Prisma), ядру не нужны; questionnaire-field-mirror приедет,
// когда понадобится потребителю пакета.
export * from './portal-questionnaires.schema';
