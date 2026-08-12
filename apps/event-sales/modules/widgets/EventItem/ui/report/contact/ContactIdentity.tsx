'use client';

import { FC } from 'react';
import { User } from 'lucide-react';
import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import type { ContactCardView } from '../../../lib/hooks/use-contact-card';

/**
 * Кто это: имя, должность и пометки — откуда контакт и не разошёлся ли он с
 * контактом плана.
 *
 * Обе пометки появляются только когда есть что сказать: контакт компании и
 * один человек на отчёт с планом — обычный случай, шуметь о нём незачем.
 */
export const ContactIdentity: FC<{ card: ContactCardView }> = ({ card }) => (
    <>
        <HintTooltip
            title="С кем велись переговоры"
            lines={[card.post, card.phone, card.email].filter(Boolean)}
        >
            <span className="inline-flex min-w-0 items-center gap-1.5">
                <User
                    aria-hidden
                    className="size-3.5 shrink-0 text-muted-foreground"
                />
                {card.report ? (
                    <span className="min-w-0 truncate text-xs font-medium">
                        {card.name}
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground">
                        Контакт не выбран
                    </span>
                )}
            </span>
        </HintTooltip>

        {card.post && (
            <span className="min-w-0 shrink truncate text-[0.6875rem] text-muted-foreground">
                {card.post}
            </span>
        )}

        {/* Контакт не из компании — говорим откуда, иначе он выглядит в
            списке чужим (и однофамильцы путаются). */}
        {card.source && (
            <ToneBadge variant="outline" size="sm" className="border-dashed">
                {card.source}
            </ToneBadge>
        )}

        {card.planName && (
            <ToneBadge variant="soft" size="sm">
                план: {card.planName}
            </ToneBadge>
        )}
    </>
);
