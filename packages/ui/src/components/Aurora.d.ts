/**
 * Типы для вендоренного reactbits-компонента (Aurora.jsx).
 * Цвета здесь — hex осознанно: это параметры WebGL-шейдера, а не цвета интерфейса
 * (тот же принцип, что у processing-fx.ts в kpi-sales).
 */
export interface AuroraProps {
    /** Опорные цвета градиента (hex, параметры шейдера). */
    colorStops?: string[];
    amplitude?: number;
    blend?: number;
    speed?: number;
    time?: number;
}

declare const Aurora: (props: AuroraProps) => import('react').JSX.Element;
export default Aurora;
