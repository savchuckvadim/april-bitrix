import React from 'react';
import { Mail, Phone, Globe } from 'lucide-react';
import {
    SUPPORT_CHANNELS,
    SUPPORT_SCHEDULE,
    SUPPORT_RESPONSE_TIME,
    SUPPORT_VENDOR,
    SupportChannel,
} from '../constants/support';

const channelIcons: Record<SupportChannel['kind'], React.ElementType> = {
    email: Mail,
    phone: Phone,
    site: Globe,
};

export const SupportContacts: React.FC = () => (
    <section className="mb-10">
        <ul className="space-y-4 mb-6">
            {SUPPORT_CHANNELS.map((channel) => {
                const Icon = channelIcons[channel.kind];
                return (
                    <li key={channel.href} className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                        <a
                            href={channel.href}
                            className="text-lg text-foreground hover:text-primary transition-colors"
                        >
                            {channel.label}
                        </a>
                    </li>
                );
            })}
        </ul>
        <div className="space-y-2 text-muted-foreground">
            <p>{SUPPORT_SCHEDULE}</p>
            <p>{SUPPORT_RESPONSE_TIME}</p>
            <p>{SUPPORT_VENDOR}</p>
        </div>
    </section>
);
