import { FLOW_STEPS, type FlowStep } from './routes';

/**
 * Где идёт сборка: адреса и состав шагов. Экраны шагов одни и те же, а фрейм
 * сделки и публичная ссылка отличаются этими тремя значениями.
 */
export interface FlowSurface {
    /** Префикс адресов: у публичной версии в нём токен ссылки */
    basePath: string;
    steps: FlowStep[];
    /** Есть ли экран перед первым шагом, куда ведёт «Назад» */
    hasStartScreen: boolean;
}

export const BITRIX_FLOW_SURFACE: FlowSurface = {
    basePath: '',
    steps: FLOW_STEPS,
    hasStartScreen: true,
};
