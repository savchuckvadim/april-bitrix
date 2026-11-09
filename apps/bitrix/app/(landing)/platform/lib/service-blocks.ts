import type { PlatformService } from '../model/types';
import type { ShotMediaMap } from './platform-media';
import { visibleShots } from './shot-visibility';

export type ServiceBlockKind =
    | 'benefits'
    | 'steps'
    | 'roles'
    | 'features'
    | 'gallery'
    | 'faq'
    | 'related';

export type ServiceBlockTone = 'plain' | 'muted';

export interface ServiceBlock {
    kind: ServiceBlockKind;
    tone: ServiceBlockTone;
}

/**
 * Порядок секций страницы сервиса и их подложки.
 *
 * Пустые секции выпадают (нет ролей, нет готовых кадров), поэтому подложки
 * считаются после отбора: соседние секции всегда разного тона, а последняя
 * перед формой заявки — без подложки (у формы она своя).
 */
export function buildServiceBlocks(service: PlatformService, media: ShotMediaMap): ServiceBlock[] {
    const kinds: ServiceBlockKind[] = ['benefits', 'steps'];
    if (service.roles && service.roles.length > 0) kinds.push('roles');
    kinds.push('features');
    if (visibleShots(service.gallery, media).length > 0) kinds.push('gallery');
    if (service.faq.length > 0) kinds.push('faq');
    if (service.related.length > 0) kinds.push('related');

    return kinds.map((kind, index) => ({
        kind,
        tone: (kinds.length - 1 - index) % 2 === 0 ? 'plain' : 'muted',
    }));
}
