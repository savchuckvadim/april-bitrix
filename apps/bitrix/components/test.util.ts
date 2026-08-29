import {
    BxDepartmentRequestDto,
    BxDepartmentRequestDtoDepartment,
    BxDepartmentRequestDtoDomain,
    getBitrixDomainDepartment,
} from '@workspace/nest-api';

/**
 * Черновик проверки эндпоинта отдела: дёргаем /api/bx/department напрямую.
 *
 * Тело запроса описано BxDepartmentRequestDto (домен и группа отделов —
 * перечисления), а BxDepartmentDto — это уже сам отдел из ответа. Приведения
 * здесь не нужно: значения проверяет компилятор.
 */
export const test = async () => {
    const api = getBitrixDomainDepartment();
    const dto: BxDepartmentRequestDto = {
        domain: BxDepartmentRequestDtoDomain['april-devbitrix24ru'],
        department: BxDepartmentRequestDtoDepartment.sales,
    };

    const result = await api.departmentGetFullDepartment(dto);

    return result;
};
