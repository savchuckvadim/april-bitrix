import { describe, expect, it } from 'vitest';
import { ACADEMY_PACKAGES, academyPackagesFor, catalogFromOldInit } from '@/modules/entities/catalog';
import oldInit from '@/modules/entities/catalog/lib/__fixtures__/oldinit.json';
import { groupAcademyPackages } from '../academy-groups.util';

const catalog = catalogFromOldInit(oldInit);

describe('группы пакетов академии', () => {
    it('срок 3 месяца: пакеты на 3 месяца и открытые — двумя группами', () => {
        const groups = groupAcademyPackages(academyPackagesFor(catalog, 3), 3);
        expect(groups.map(group => group.title)).toEqual(['На срок сделки: 3 мес', 'До конца действия комплекта']);
        expect(groups[0]!.packages.map(pkg => pkg.code)).toEqual(['academy_2', 'academy_3', 'academy_4']);
        expect(groups[1]!.packages).toHaveLength(4);
    });

    it('срок неизвестен: все пакеты, заголовок без срока', () => {
        const groups = groupAcademyPackages(ACADEMY_PACKAGES, null);
        expect(groups[0]!.title).toBe('На срок договора');
        expect(groups[0]!.packages).toHaveLength(17);
    });

    it('срок 2 месяца: пакетов на срок нет — только открытые', () => {
        const groups = groupAcademyPackages(academyPackagesFor(catalog, 2), 2);
        expect(groups.map(group => group.title)).toEqual(['До конца действия комплекта']);
    });
});
