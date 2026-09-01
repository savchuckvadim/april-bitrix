export type DepartamentCode = 'sales' | 'tmc';

/** Runtime-список кодов подразделения для валидации и Swagger. */
export const DEPARTAMENT_CODE_VALUES = [
    'sales',
    'tmc',
] as const satisfies readonly DepartamentCode[];

export interface DepartamentModeDto {
    /** Идентификатор подразделения в портале Bitrix. */
    id: number;

    /**
     * Код подразделения, определяющий ветку flow: `sales` (продажи)
     * или `tmc` (товарно-материальные ценности).
     */
    code: DepartamentCode;

    /** Отображаемое название подразделения. */
    name: string;
}

export interface DepartamentDto {
    /** Текущий режим/подразделение, в котором выполняется flow. */
    mode?: DepartamentModeDto;
}
