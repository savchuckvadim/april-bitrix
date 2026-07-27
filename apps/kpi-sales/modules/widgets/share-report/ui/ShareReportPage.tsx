'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type {
    ShareLinkPublicMetaDto,
    ShareLinkPublicResponseDto,
} from '@workspace/nest-kpi-report-sales-api';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { Processing } from '@/modules/shared';
import { hydrateFromShareSnapshot } from '../model/share-report-thunks';
import { ShareReportHeader } from './ShareReportHeader';

/** Куда уводим по протухшей/отозванной ссылке. */
const EXPIRED_REDIRECT_URL = 'https://bitrix.april-app.ru';

/** Интервал heartbeat присутствия (бэк держит онлайн 45с). */
const PRESENCE_PING_MS = 20_000;

/** Случайный id вкладки зрителя (per-tab, для presence). */
const getViewerId = (): string => {
    if (typeof window === 'undefined') return '';
    const KEY = 'kpi-share-viewer-id';
    let id = sessionStorage.getItem(KEY);
    if (!id) {
        id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
        sessionStorage.setItem(KEY, id);
    }
    return id;
};

// Тот же тяжёлый виджет отчёта, что и во фрейме, — лениво.
const Report = dynamic(
    () =>
        import('@/modules/widgets/report/report-view').then(m => m.Report),
    {
        ssr: false,
        loading: () => <Processing />,
    },
);

/**
 * Публичная read-only страница отчёта: тянет снимок через Next-прокси
 * (/api/share/[token] — бэкенд наружу не светится), сидит Redux-слайсы
 * и рендерит обычный виджет отчёта. Без Bitrix-init, без фильтров.
 * 410/404 → редирект на сайт.
 */
export const ShareReportPage = ({ token }: { token: string }) => {
    const dispatch = useAppDispatch();
    const [meta, setMeta] = useState<ShareLinkPublicMetaDto | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        // поисковикам тут делать нечего (страница с бизнес-данными)
        const robots = document.createElement('meta');
        robots.name = 'robots';
        robots.content = 'noindex, nofollow';
        document.head.appendChild(robots);
        return () => robots.remove();
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const response = await fetch(
                    `/api/share/${encodeURIComponent(token)}`,
                    { cache: 'no-store' },
                );
                if (!response.ok) {
                    window.location.replace(EXPIRED_REDIRECT_URL);
                    return;
                }
                const payload =
                    (await response.json()) as ShareLinkPublicResponseDto;
                if (cancelled) return;
                // Снимок ещё готовится (async-создание) — данные не сидим,
                // показываем «готовится» и поллим (эффект ниже).
                if (payload.meta?.status !== 'generating') {
                    dispatch(hydrateFromShareSnapshot(payload));
                }
                setMeta(payload.meta);
            } catch {
                if (!cancelled) setFailed(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [dispatch, token]);

    // Ссылка создана асинхронно, снимок ещё строится: поллим быстрее
    // (каждые 4с) до готовности, затем ПОЛНАЯ гидратация и обычный рендер.
    useEffect(() => {
        if (meta?.status !== 'generating') return;
        const id = setInterval(async () => {
            try {
                const response = await fetch(
                    `/api/share/${encodeURIComponent(token)}`,
                    { cache: 'no-store' },
                );
                if (response.status === 404 || response.status === 410) {
                    window.location.replace(EXPIRED_REDIRECT_URL);
                    return;
                }
                if (!response.ok) return;
                const payload =
                    (await response.json()) as ShareLinkPublicResponseDto;
                if (payload.meta?.status === 'ready') {
                    dispatch(hydrateFromShareSnapshot(payload));
                    setMeta(payload.meta);
                }
            } catch {
                // сеть моргнула — следующий тик повторит
            }
        }, 4000);
        return () => clearInterval(id);
    }, [dispatch, token, meta?.status]);

    // Тихое фоновое обновление обновляемой ссылки: cron на бэке пересчитывает
    // снимок каждые refreshIntervalSec — страница в том же ритме перечитывает
    // его и подменяет ТОЛЬКО данные (dataOnly), без лоадера и без сброса
    // локальных настроек зрителя (вкладка, пороги, цепочки конверсий).
    // generatedAt не изменился — ничего не диспатчим. Протухла — редирект.
    useEffect(() => {
        if (!meta?.isRefreshable || meta.status !== 'ready') return;
        const intervalMs = Math.max(meta.refreshIntervalSec || 900, 60) * 1000;

        const id = setInterval(async () => {
            try {
                const response = await fetch(
                    `/api/share/${encodeURIComponent(token)}`,
                    { cache: 'no-store' },
                );
                if (response.status === 404 || response.status === 410) {
                    window.location.replace(EXPIRED_REDIRECT_URL);
                    return;
                }
                if (!response.ok) return; // транзиент — повторим в следующий тик
                const payload =
                    (await response.json()) as ShareLinkPublicResponseDto;
                if (payload.meta?.generatedAt !== meta.generatedAt) {
                    dispatch(
                        hydrateFromShareSnapshot(payload, { dataOnly: true }),
                    );
                    setMeta(payload.meta);
                }
            } catch {
                // сеть моргнула — молчим, следующий тик повторит
            }
        }, intervalMs);

        return () => clearInterval(id);
    }, [dispatch, token, meta]);

    // Presence: пока снимок готов и вкладка видима — шлём heartbeat раз в
    // ~20с (бэк держит «онлайн» 45с). Уход/скрытие вкладки — мгновенный
    // выход через sendBeacon (не ждём протухания TTL). WS у публики не
    // поднимаем — только HTTP через прокси.
    useEffect(() => {
        if (meta?.status !== 'ready') return;
        const viewerId = getViewerId();
        const pingUrl = `/api/share/${encodeURIComponent(token)}/ping`;
        const leaveUrl = `/api/share/${encodeURIComponent(token)}/leave`;
        const body = () =>
            new Blob([JSON.stringify({ viewerId })], {
                type: 'application/json',
            });

        const ping = () => {
            if (document.visibilityState !== 'visible') return;
            fetch(pingUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ viewerId }),
                keepalive: true,
            }).catch(() => {});
        };
        const leave = () => navigator.sendBeacon?.(leaveUrl, body());

        ping();
        const id = setInterval(ping, PRESENCE_PING_MS);

        // Скрыли вкладку → мгновенно offline; вернули → снова ping.
        const onVisibility = () =>
            document.visibilityState === 'visible' ? ping() : leave();
        // Закрытие/навигация — pagehide надёжнее beforeunload.
        window.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('pagehide', leave);

        return () => {
            clearInterval(id);
            window.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('pagehide', leave);
            leave();
        };
    }, [token, meta?.status]);

    if (failed) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 text-muted-foreground">
                Не удалось загрузить отчёт — попробуйте обновить страницу
            </div>
        );
    }

    if (!meta) {
        return <Processing />;
    }

    // Снимок ещё готовится (async-создание): дружелюбный экран + автоподхват.
    if (meta.status === 'generating') {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
                <Processing />
                <div>
                    <p className="text-lg font-medium">Отчёт готовится…</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Собираем данные — обычно занимает до минуты. Страница
                        обновится сама.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ShareReportHeader meta={meta} token={token} />
            <div className="p-7 pt-24">
                <Report />
            </div>
        </>
    );
};
