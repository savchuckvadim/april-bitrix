/** Типы для вендоренного reactbits-компонента (GradientText.jsx). */
export interface GradientTextProps {
    children?: import('react').ReactNode;
    className?: string;
    /** Стопы градиента (hex — параметр эффекта, не токен интерфейса). */
    colors?: string[];
    /** Длительность цикла анимации, сек. */
    animationSpeed?: number;
    showBorder?: boolean;
}

declare const GradientText: (props: GradientTextProps) => import('react').JSX.Element;
export default GradientText;
