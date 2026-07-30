import React from 'react';
import {
    SUPPORT_REQUEST_GUIDE_TITLE,
    SUPPORT_REQUEST_GUIDE_INTRO,
    SUPPORT_REQUEST_GUIDE_ITEMS,
} from '../constants/support';

export const SupportRequestGuide: React.FC = () => (
    <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">
            {SUPPORT_REQUEST_GUIDE_TITLE}
        </h2>
        <p className="text-muted-foreground mb-3">{SUPPORT_REQUEST_GUIDE_INTRO}</p>
        <ol className="list-decimal pl-6 space-y-2 text-foreground/90">
            {SUPPORT_REQUEST_GUIDE_ITEMS.map((item, index) => (
                <li key={index} className="leading-relaxed">
                    {item}
                </li>
            ))}
        </ol>
    </section>
);
