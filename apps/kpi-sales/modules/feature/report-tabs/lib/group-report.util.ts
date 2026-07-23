// Секции структуры переехали в entities/department (это чистые функции
// над SalesDepartment); здесь — реэкспорт для потребителей фичи.
export {
    buildDepartmentSections,
    buildGroupSections,
    filterSectionsByPresent,
} from '@/modules/entities/department';
export type { StructureSection } from '@/modules/entities/department';
