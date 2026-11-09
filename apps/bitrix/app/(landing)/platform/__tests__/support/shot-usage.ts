/**
 * Где на сайте стоит каждый кадр: нужно и задание на съёмку («куда пойдёт»),
 * и проверкам (кадр без места — работа, которую никто не увидит).
 */

import { HUB_OVERVIEW_SHOT } from '../../model/hub';
import { PLATFORM_ROOT, platformServiceHref } from '../../model/navigation';
import { PLATFORM_SERVICES } from '../../model/services';
import type { PlatformShotId } from '../../model/shots';
import type { PlatformService } from '../../model/types';

/** Все кадры страницы сервиса в порядке появления: первый экран, шаги, галерея. */
export const shotsOfService = (service: PlatformService): PlatformShotId[] => [
    ...(service.hero.shotId ? [service.hero.shotId] : []),
    ...service.steps.items.flatMap(step => (step.shotId ? [step.shotId] : [])),
    ...service.gallery,
];

/** Кадр → адреса страниц, где он стоит. */
export function collectShotUsage(): Map<PlatformShotId, string[]> {
    const usage = new Map<PlatformShotId, string[]>();
    const add = (id: PlatformShotId, page: string) =>
        usage.set(id, [...(usage.get(id) ?? []), page]);

    add(HUB_OVERVIEW_SHOT, PLATFORM_ROOT);
    for (const service of PLATFORM_SERVICES) {
        for (const id of shotsOfService(service)) {
            add(id, platformServiceHref(service.slug));
        }
    }
    return usage;
}
