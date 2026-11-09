import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import {
    PLATFORM_MEDIA_SECTION,
    PLATFORM_SHOTS,
    parseSiteMediaItems,
    siteMediaPath,
    type PlatformShotId,
    type SiteMediaItem,
    type SiteMediaKind,
} from '@workspace/site-media';
import { botApiUrl } from '@/lib/bot-api';

/**
 * Картинки и видео раздела с сервера. Файлы в git не лежат: их загружают в
 * админке («Сайт → Картинки и видео»), бэк (apps/bot) хранит их по местам
 * кадров и отдаёт список. Страницы раздела статические и сверяют список раз
 * в минуту (ISR) — загруженное появляется без выкладки.
 *
 * Только сервер: адрес бэка снаружи не виден, файлы идут через /media сайта.
 */

/** Файл на месте кадра — как его рисует страница. */
export interface ShotMedia {
    /** Что лежит на самом деле (по содержимому файла). */
    kind: SiteMediaKind;
    src: string;
    poster?: string;
}

/** Готовые кадры раздела: есть в списке — есть на странице. */
export type ShotMediaMap = ReadonlyMap<PlatformShotId, ShotMedia>;

export const NO_SHOT_MEDIA: ShotMediaMap = new Map();

/**
 * Через сколько секунд страница сверяет список кадров. Его же повторяет
 * `export const revalidate` страниц раздела: Next требует там литерал.
 */
export const PLATFORM_MEDIA_REVALIDATE_SECONDS = 60;

export const PLATFORM_MEDIA_PATH = `api/site-media/${PLATFORM_MEDIA_SECTION}`;

const FETCH_TIMEOUT_MS = 5_000;

const isPlatformShotId = (slot: string): slot is PlatformShotId =>
    Object.hasOwn(PLATFORM_SHOTS, slot);

/**
 * Список с бэка → кадры страниц. Места, которых нет в реестре (кадр убрали
 * со страниц, а файл остался), пропускаются.
 */
export function toShotMediaMap(items: readonly SiteMediaItem[]): ShotMediaMap {
    const media = new Map<PlatformShotId, ShotMedia>();
    for (const item of items) {
        if (!isPlatformShotId(item.slot)) continue;
        media.set(item.slot, {
            kind: item.kind,
            src: siteMediaPath(PLATFORM_MEDIA_SECTION, item.file),
            ...(item.poster
                ? { poster: siteMediaPath(PLATFORM_MEDIA_SECTION, item.poster) }
                : {}),
        });
    }
    return media;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

/** Ответ Nest приходит в конверте `{ resultCode: 0, data }`. */
const unwrapEnvelope = (body: unknown): unknown => {
    if (!isRecord(body) || body.resultCode !== 0) {
        throw new Error('site-media: ответ бэка не в конверте resultCode 0');
    }
    return body.data;
};

/**
 * Минутный сбой бэка не должен стирать кадры с живой страницы: на проде
 * ошибка пробрасывается, и Next оставляет прежнюю версию страницы до
 * следующей сверки. При сборке образа и при разработке бэка может не быть —
 * тогда страница без кадров: на проде блоки перестроятся, в разработке
 * будут рамки «что снять».
 */
const keepPreviousPageOnError = (): boolean =>
    // eslint-disable-next-line turbo/no-undeclared-env-vars -- NODE_ENV и NEXT_PHASE задаёт сам Next
    process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD;

export async function fetchPlatformMedia(): Promise<ShotMediaMap> {
    try {
        const response = await fetch(botApiUrl(PLATFORM_MEDIA_PATH), {
            next: { revalidate: PLATFORM_MEDIA_REVALIDATE_SECONDS },
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
        if (!response.ok) {
            throw new Error(`site-media: бэк ответил ${response.status}`);
        }
        const data = unwrapEnvelope(await response.json());
        return toShotMediaMap(parseSiteMediaItems(data));
    } catch (error) {
        if (keepPreviousPageOnError()) throw error;
        console.warn('Картинки и видео раздела недоступны — страница без кадров:', error);
        return NO_SHOT_MEDIA;
    }
}
