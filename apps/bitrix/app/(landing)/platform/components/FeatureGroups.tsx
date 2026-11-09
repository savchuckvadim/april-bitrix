import { Check } from 'lucide-react';
import type { PlatformFeatureGroup } from '../model/types';

export interface FeatureGroupsProps {
    groups: readonly PlatformFeatureGroup[];
}

/** Полное описание возможностей — для тех, кто вчитывается перед решением. */
export function FeatureGroups({ groups }: FeatureGroupsProps) {
    return (
        <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
            {groups.map(group => (
                <div key={group.title}>
                    <h3 className="mb-4 text-lg font-semibold text-foreground">{group.title}</h3>
                    <ul className="flex flex-col gap-3">
                        {group.items.map(item => (
                            <li key={item} className="flex gap-3 text-muted-foreground">
                                <Check className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                                <span className="text-pretty">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
