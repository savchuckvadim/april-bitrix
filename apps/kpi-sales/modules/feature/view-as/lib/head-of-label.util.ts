import type { AccessHeadOf } from '@/modules/shared/access';

/** Человекочитаемые названия ролей структуры (BxCurrentUserDto.headOf). */
export const headOfLabel = (headOf: AccessHeadOf | undefined): string => {
    switch (headOf) {
        case 'cup':
            return 'руководитель направления';
        case 'op':
            return 'руководитель отдела';
        case 'group':
            return 'руководитель группы';
        default:
            return 'менеджер';
    }
};
