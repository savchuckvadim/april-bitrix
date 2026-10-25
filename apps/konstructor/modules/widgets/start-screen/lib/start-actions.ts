import { BadgePercent, Plus, Star } from 'lucide-react';
import type { ComponentType } from 'react';
import type { Tone } from '@workspace/april-ui/tones';
import { ROUTE_KONSTRUCTOR } from '@/modules/shared/lib/routing';

export interface StartAction {
    route: ROUTE_KONSTRUCTOR;
    title: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    tone: Tone;
    /** Экран ещё ждёт API — плитка ведёт на честное «скоро». */
    soon: boolean;
}

/** Три входа в новое предложение (docs/routing.md §1). */
export const START_ACTIONS: StartAction[] = [
    {
        route: ROUTE_KONSTRUCTOR.FAVORITES,
        title: 'Избранное',
        description:
            'Ваши сохранённые предложения. Загрузите — и сразу к документам.',
        icon: Star,
        tone: 'warning',
        soon: false,
    },
    {
        route: ROUTE_KONSTRUCTOR.PROMOTIONS,
        title: 'Акции',
        description:
            'Предложения по действующим акциям: комплект и цены уже собраны.',
        icon: BadgePercent,
        tone: 'info',
        soon: false,
    },
    {
        route: ROUTE_KONSTRUCTOR.PARAMS,
        title: 'Создать',
        description: 'Собрать с нуля: параметры, комплект, цены, документ.',
        icon: Plus,
        tone: 'primary',
        soon: false,
    },
];
