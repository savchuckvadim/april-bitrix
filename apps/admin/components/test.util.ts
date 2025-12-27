import { BxDepartmentDto, getBitrix24Department } from "@workspace/nest-api";

export const test = async () => {
    const api = getBitrix24Department();
    const result = await api.departmentGetFullDepartment({
        domain: 'april-dev.bitrix24.ru',
        department: 'sales',
    } as BxDepartmentDto);

    return result;

};

