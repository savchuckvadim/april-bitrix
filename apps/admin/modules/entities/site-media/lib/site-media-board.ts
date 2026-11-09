import {
    PLATFORM_SHOT_PAGES,
    PLATFORM_SHOTS,
    platformShotPage,
    type PlatformShotId,
    type PlatformShotSpec,
    type SiteMediaItem,
} from '@workspace/site-media';

/** Место кадра в админке: что снять и что сейчас загружено. */
export interface SiteMediaSlotView {
    id: PlatformShotId;
    spec: PlatformShotSpec;
    item?: SiteMediaItem;
}

/** Страница сайта со своими местами кадров. */
export interface SiteMediaPageView {
    title: string;
    path: string;
    slots: SiteMediaSlotView[];
    uploaded: number;
}

export interface SiteMediaBoard {
    pages: SiteMediaPageView[];
    /** Загружено на места, которых больше нет на страницах, — кандидаты на удаление. */
    orphans: SiteMediaItem[];
    total: number;
    uploaded: number;
    /** Сколько мест первой очереди (первые экраны, ролики) ещё без файла. */
    firstPriorityMissing: number;
}

const SHOT_IDS = Object.keys(PLATFORM_SHOTS) as PlatformShotId[];

const isPlatformShotId = (slot: string): slot is PlatformShotId =>
    Object.hasOwn(PLATFORM_SHOTS, slot);

/**
 * Места кадров по страницам сайта: внутри страницы — сначала первая
 * очередь (без неё страница слабая), дальше порядок реестра.
 */
export function buildSiteMediaBoard(items: readonly SiteMediaItem[]): SiteMediaBoard {
    const bySlot = new Map(items.map(item => [item.slot, item]));

    const pages = PLATFORM_SHOT_PAGES.map((page): SiteMediaPageView => {
        const slots = SHOT_IDS.filter(id => platformShotPage(id) === page)
            .map((id): SiteMediaSlotView => ({ id, spec: PLATFORM_SHOTS[id], item: bySlot.get(id) }))
            .sort((a, b) => a.spec.priority - b.spec.priority);
        return {
            title: page.title,
            path: page.path,
            slots,
            uploaded: slots.filter(slot => slot.item).length,
        };
    }).filter(page => page.slots.length > 0);

    const placed = pages.flatMap(page => page.slots);
    return {
        pages,
        orphans: items.filter(item => !isPlatformShotId(item.slot)),
        total: placed.length,
        uploaded: placed.filter(slot => slot.item).length,
        firstPriorityMissing: placed.filter(slot => slot.spec.priority === 1 && !slot.item).length,
    };
}
