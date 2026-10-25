import { Briefcase, Globe, HardDrive, Layers } from 'lucide-react';
import type { ComponentType } from 'react';
import type { ComplectType, SupplyKind } from '@/modules/entities/catalog';

export interface ParamOption<T extends string> {
    value: T;
    title: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
}

/** Линейка (легаси «Тип комплекта»). */
export const COMPLECT_TYPE_OPTIONS: ParamOption<ComplectType>[] = [
    {
        value: 'prof',
        title: 'Гарант ПРОФ',
        description: 'Комплекты для бухгалтера, юриста, эксперта, предприятия.',
        icon: Briefcase,
    },
    {
        value: 'universal',
        title: 'Универсальная линейка',
        description: 'Комплекты универсальной линейки.',
        icon: Layers,
    },
];

/** Вид доступа (легаси «Тип доступа»). */
export const SUPPLY_KIND_OPTIONS: ParamOption<SupplyKind>[] = [
    {
        value: 'internet',
        title: 'Интернет',
        description: 'Онлайн-доступ к системе.',
        icon: Globe,
    },
    {
        value: 'proxima',
        title: 'Проксима',
        description: 'Локальная версия: флэш или локальная сеть.',
        icon: HardDrive,
    },
];
