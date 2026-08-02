/**
 * Типы для вендоренного reactbits-компонента (LiquidEther.jsx) — WebGL-симуляция
 * жидкости на three. Тяжёлый: подключать только через next/dynamic({ ssr: false }).
 */
export interface LiquidEtherProps {
    mouseForce?: number;
    cursorSize?: number;
    isViscous?: boolean;
    viscous?: number;
    iterationsViscous?: number;
    iterationsPoisson?: number;
    dt?: number;
    BFECC?: boolean;
    resolution?: number;
    isBounce?: boolean;
    /** Палитра симуляции (hex — параметр WebGL, не токен интерфейса). */
    colors?: string[];
    style?: import('react').CSSProperties;
    className?: string;
    autoDemo?: boolean;
    autoSpeed?: number;
    autoIntensity?: number;
    takeoverDuration?: number;
    autoResumeDelay?: number;
    autoRampDuration?: number;
}

declare const LiquidEther: (props: LiquidEtherProps) => import('react').JSX.Element;
export default LiquidEther;
