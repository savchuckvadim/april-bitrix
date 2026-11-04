'use client';

import { academyPackageLabel } from '@/modules/entities/catalog';
import type { AcademyPickerState } from '../hooks/use-academy-picker';
import { AcademyPackageOption } from './AcademyPackageOption';

export interface AcademyPackageListProps {
    picker: AcademyPickerState;
}

/** Список пакетов под срок сделки: один выбирается, «Без академии» снимает. */
export const AcademyPackageList = ({ picker }: AcademyPackageListProps) => {
    const currentCode = picker.current?.code ?? null;

    return (
        <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">
                {picker.termMonths === null
                    ? 'Срок сделки появится после выбора договора'
                    : `Срок сделки ${picker.termMonths} мес: количество × договор`}
            </span>
            <AcademyPackageOption
                label="Без академии"
                active={currentCode === null}
                onSelect={() => picker.choose(null)}
            />
            {picker.groups.map(group => (
                <div key={group.title} className="flex flex-col gap-0.5">
                    <span className="px-2 pt-1 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
                        {group.title}
                    </span>
                    {group.packages.map(pkg => (
                        <AcademyPackageOption
                            key={pkg.code}
                            label={academyPackageLabel(pkg)}
                            active={pkg.code === currentCode}
                            onSelect={() => picker.choose(pkg.code)}
                        />
                    ))}
                </div>
            ))}
            {picker.current && !picker.currentFits ? (
                <AcademyPackageOption
                    label={academyPackageLabel(picker.current)}
                    active
                    hint="не под срок сделки"
                    onSelect={() => picker.choose(picker.current?.code ?? null)}
                />
            ) : null}
        </div>
    );
};
