import type { KAcademyPackage } from '@/modules/entities/catalog';

export interface AcademyPackageGroup {
    title: string;
    packages: KAcademyPackage[];
}

/**
 * Пакеты академии для списка выбора: сначала пакеты на срок сделки, затем
 * пакеты «до конца действия комплекта» (легаси показывал их в одном окне
 * плашками по часам).
 */
export const groupAcademyPackages = (
    packages: KAcademyPackage[],
    termMonths: number | null,
): AcademyPackageGroup[] => {
    const term = packages.filter(pkg => pkg.monthQuantity !== null);
    const open = packages.filter(pkg => pkg.monthQuantity === null);
    const groups: AcademyPackageGroup[] = [];
    if (term.length) {
        groups.push({
            title: termMonths === null ? 'На срок договора' : `На срок сделки: ${termMonths} мес`,
            packages: term,
        });
    }
    if (open.length) groups.push({ title: 'До конца действия комплекта', packages: open });
    return groups;
};
