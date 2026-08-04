'use client';

import { FC } from 'react';
import { EntityHistoryCard } from '@/modules/entities/EVHistory/ui/EntityHistoryCard';

/**
 * История общения по компании во вкладке отчёта.
 *
 * Вся логика (ленивая загрузка при появлении, постраничность, фолбэк на поля
 * клиента) живёт в самой сущности — вкладка её только показывает. Так экран
 * сущности и вкладка не разъезжаются в поведении.
 */
export const HistoryTab: FC = () => <EntityHistoryCard />;
