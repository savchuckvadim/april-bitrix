'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { cn } from '@workspace/ui/lib/utils';
// Прямой путь: барель фичи тянет полный список с фильтрами.
import { ContactsBriefCard } from '@/modules/features/ContactsHub/ui/ContactsBriefCard';

// История — отдельным куском кода и только по клику: она ходит в портал.
const EntityHistoryCard = dynamic(
    () =>
        import('@/modules/entities/EVHistory/ui/EntityHistoryCard').then(
            module => module.EntityHistoryCard,
        ),
    { ssr: false },
);

interface EventListSideProps {
    className?: string;
}

/**
 * Вторая колонка списка дел в компактной встройке (владелец, 05.10.2026):
 * рядом с карточками дел — контакты клиента, история — вкладкой по клику.
 *
 * Контакты видны сразу и ничего не стоят: они уже загружены для отчёта.
 * Историю вкладка НЕ монтирует, пока её не выбрали, — запрос к порталу на
 * каждое открытие фрейма противоречил бы облегчённому режиму.
 */
export const EventListSide: FC<EventListSideProps> = ({ className }) => (
    <Tabs defaultValue="contacts" className={cn('min-w-0 gap-2', className)}>
        <TabsList className="h-7 gap-0.5 self-start p-0.5">
            <TabsTrigger value="contacts" className="px-2 text-xs">
                контакты
            </TabsTrigger>
            <TabsTrigger value="history" className="px-2 text-xs">
                история
            </TabsTrigger>
        </TabsList>
        <TabsContent value="contacts" className="min-w-0">
            <ContactsBriefCard />
        </TabsContent>
        <TabsContent value="history" className="min-w-0">
            <EntityHistoryCard />
        </TabsContent>
    </Tabs>
);
