'use client';

import { useEffect } from 'react';
import { BOOT_PRELOADER_HIDE_CLASS, BOOT_PRELOADER_ID } from './BootPreloader';

export interface BootPreloaderGateProps {
    /**
     * Когда гасить. `true` (по умолчанию) — сразу после гидратации: годится
     * приложениям, у которых за прелоадером сразу готовый экран.
     *
     * Приложение, которое после гидратации ещё ждёт данные, передаёт сюда свой
     * признак готовности — тогда пользователь видит ОДИН экран загрузки, а не
     * boot-прелоадер и следом собственный (это и выглядит как «прыжок»).
     */
    ready?: boolean;
    /** Задержка перед удалением из DOM, мс (должна перекрывать transition). */
    removeAfterMs?: number;
    /**
     * Предохранитель: сколько ждать `ready`, прежде чем погасить принудительно.
     * Инициализация может не завершиться никогда (нет фрейма, упал бэк) —
     * вечное кольцо хуже, чем честный экран приложения под ним.
     */
    maxWaitMs?: number;
    /**
     * Страховочный гейт: гасит прелоадер, только если его не взял на себя
     * другой гейт (с `ready`).
     *
     * Нужен приложениям со смешанной маршрутизацией, где инициализация есть не
     * везде: страницам без неё гасить нужно сразу, страницам с ней — по
     * готовности. Ставится в корневом layout; на порядок эффектов React не
     * опирается — решение принимается тиком позже, см. реализацию.
     */
    fallback?: boolean;
}

/** Отметка «прелоадер уже за кем-то закреплён» — на самом узле, без общего стора. */
const CLAIM_ATTR = 'data-boot-claimed';

/**
 * Гасит boot-прелоадер: по умолчанию сразу после гидратации, а с `ready` —
 * когда приложение действительно готово.
 *
 * Отдельным клиентским компонентом, потому что сам BootPreloader обязан
 * рендериться на сервере (он и нужен до загрузки JS).
 *
 * Ничего не рисует.
 */
export const BootPreloaderGate = ({
    ready = true,
    removeAfterMs = 400,
    maxWaitMs = 20_000,
    fallback = false,
}: BootPreloaderGateProps) => {
    useEffect(() => {
        const boot = document.getElementById(BOOT_PRELOADER_ID);
        if (!boot) return;

        // Удаление из DOM намеренно не отменяем при размонтировании: узел и так
        // уже погашен и обязан исчезнуть.
        const hide = () => {
            boot.classList.add(BOOT_PRELOADER_HIDE_CLASS);
            setTimeout(() => boot.remove(), removeAfterMs);
        };

        if (fallback) {
            /*
             * Решение откладываем на отдельную задачу. Эффекты всех гейтов
             * отрабатывают в одном тике, поэтому к моменту таймера заявка уже
             * проставлена — и порядок эффектов (то есть порядок компонентов в
             * дереве) на результат не влияет. Цена — один кадр задержки на
             * страницах без инициализации, чего не видно.
             */
            const decide = setTimeout(() => {
                if (!boot.hasAttribute(CLAIM_ATTR)) hide();
            }, 0);
            return () => clearTimeout(decide);
        }

        boot.setAttribute(CLAIM_ATTR, '');

        if (ready) {
            hide();
            return;
        }

        const failSafe = setTimeout(hide, maxWaitMs);
        return () => clearTimeout(failSafe);
    }, [ready, removeAfterMs, maxWaitMs, fallback]);

    return null;
};
