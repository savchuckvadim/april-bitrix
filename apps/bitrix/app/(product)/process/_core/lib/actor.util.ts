/**
 * Кодирование исполнителя шага. Одно место на весь движок: подписи и цвета
 * исполнителей должны совпадать в станции, в модалке, в легенде и на съездах.
 */

import type { ProcessActor } from '../types';

export const ACTOR_LABEL: Record<ProcessActor, string> = {
    sys: 'Система',
    adm: 'Администратор',
    mgr: 'Менеджер',
    rop: 'Руководитель',
};

/** Точка-индикатор исполнителя. Только токены тем, никакого хардкода. */
export const ACTOR_DOT: Record<ProcessActor, string> = {
    sys: 'bg-primary',
    adm: 'bg-info',
    mgr: 'bg-muted-foreground',
    rop: 'bg-warning',
};

/** Легенда исполнителей — тот же порядок, что и в ACTOR_LABEL. */
export const ACTOR_LEGEND: { actor: ProcessActor; label: string }[] = [
    { actor: 'sys', label: 'система' },
    { actor: 'adm', label: 'администратор' },
    { actor: 'mgr', label: 'менеджер' },
    { actor: 'rop', label: 'руководитель' },
];
