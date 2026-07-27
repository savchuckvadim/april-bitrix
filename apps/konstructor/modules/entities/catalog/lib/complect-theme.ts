import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    Briefcase,
    Building2,
    Calculator,
    Layers,
    Scale,
    ShieldCheck,
} from 'lucide-react';
import type { KComplect } from '../model/types';

/**
 * Цвет/иконка комплекта (аналог event-type-token.ts из event-sales).
 * Механика: контейнер получает data-complect="<code>" — токены
 * --complect-current/*-foreground переключаются в april-tokens.css и
 * наследуются вниз по DOM (utility-классы bg-complect-current и т.п.).
 * Если админ задал complect.color в БД — он побеждает токен через
 * инлайн-переменную (getComplectStyleOverride).
 */

/** Значение data-complect для контейнера */
export const getComplectAttr = (
    code: string | null | undefined,
): string | undefined => code ?? undefined;

/**
 * Инлайн-override цвета из БД: вешается на тот же контейнер, что и
 * data-complect. Пустой color → undefined (работает токен-палитра).
 */
export const getComplectStyleOverride = (
    complect: Pick<KComplect, 'color'> | null | undefined,
): CSSProperties | undefined => {
    const color = complect?.color;
    // легаси-значения вида 'btn__expert' — это css-классы, не цвета
    if (!color || !/^(#|oklch|rgb|hsl)/.test(color)) return undefined;
    return { '--complect-current': color } as CSSProperties;
};

type ComplectFamily = 'buh' | 'ur' | 'expert' | 'office' | 'universal';

const ICON_BY_FAMILY: Record<ComplectFamily, LucideIcon> = {
    buh: Calculator,
    ur: Scale,
    expert: ShieldCheck,
    office: Building2,
    universal: Layers,
};

const FAMILY_BY_CODE: Record<string, ComplectFamily> = {
    buh: 'buh',
    buhgos: 'buh',
    glavbuh: 'buh',
    glavbuhgos: 'buh',
    ur: 'ur',
    expert: 'expert',
    exzak: 'expert',
    exbuild: 'expert',
    exjobsec: 'expert',
    office: 'office',
    company: 'office',
    companyPro: 'office',
    classic: 'universal',
    classicPlus: 'universal',
    universal: 'universal',
    universalPlus: 'universal',
    professional: 'universal',
    master: 'universal',
    analyst: 'universal',
    analystPlus: 'universal',
    maximum: 'universal',
};

/** Иконка карточки комплекта: по семейству кода, fallback — портфель */
export const getComplectIcon = (
    code: string | null | undefined,
): LucideIcon => {
    if (!code) return Briefcase;
    const family = FAMILY_BY_CODE[code];
    return family ? ICON_BY_FAMILY[family] : Briefcase;
};
