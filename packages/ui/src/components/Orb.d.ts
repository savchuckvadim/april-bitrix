/** Типы для вендоренного reactbits-компонента (Orb.jsx). */
export interface OrbProps {
    /** Сдвиг оттенка в градусах. */
    hue?: number;
    hoverIntensity?: number;
    rotateOnHover?: boolean;
    forceHoverState?: boolean;
}

declare const Orb: (props: OrbProps) => import('react').JSX.Element;
export default Orb;
