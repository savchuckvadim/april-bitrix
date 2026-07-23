'use client';

import { ReactNode } from 'react';
import type { StructureSection } from '../../lib/group-report.util';

interface SectionListProps {
    sections: StructureSection[];
    renderSection: (userIds: Set<number>) => ReactNode;
}

export const SectionList = ({ sections, renderSection }: SectionListProps) => (
    <div className="space-y-6">
        {sections.map(section => (
            <section key={section.id}>
                <h3 className="mb-2 border-b border-border pb-1 text-base font-semibold text-foreground">
                    {section.name}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {section.userIds.length} сотр.
                    </span>
                </h3>
                {renderSection(new Set(section.userIds))}
            </section>
        ))}
    </div>
);
