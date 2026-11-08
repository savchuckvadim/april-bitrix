'use client';

import { useState } from 'react';
import { SectionCard } from '@workspace/april-ui';
import { CABINET_TEXT as TEXT } from '../../consts/cabinet.const';
import { useCabinetCard } from '../../lib/hooks/use-cabinet';
import type { CabinetPasswordLink } from '../../model';
import { CabinetClientBlock } from './components/CabinetClientBlock';
import { CabinetAppBlock } from './components/CabinetAppBlock';
import { CabinetAddMemberForm } from './components/CabinetAddMemberForm';
import { CabinetMemberRow } from './components/CabinetMemberRow';
import { CabinetTelegramList } from './components/CabinetTelegramList';
import { PasswordLinkNotice } from './components/PasswordLinkNotice';

interface CabinetPanelProps {
    portalId: number;
}

/**
 * Раздел «Кабинет» карточки портала: организация, участники и владелец,
 * ссылки на пароль, Telegram. Всё, что может владелец кабинета, April
 * делает отсюда за него (решение владельца 07.11.2026).
 */
export const CabinetPanel = ({ portalId }: CabinetPanelProps) => {
    const { data: card, isLoading, isError } = useCabinetCard(portalId);
    const [link, setLink] = useState<CabinetPasswordLink | null>(null);

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">{TEXT.loading}</p>;
    }
    if (isError || !card) {
        return <p className="text-sm text-destructive">{TEXT.loadError}</p>;
    }

    return (
        <SectionCard title={TEXT.title} description={TEXT.description}>
            <div className="flex flex-col gap-6">
                <CabinetClientBlock card={card} />

                <div className="border-t pt-4">
                    <CabinetAppBlock portalId={portalId} app={card.app} />
                </div>

                {link && (
                    <PasswordLinkNotice link={link} onClose={() => setLink(null)} />
                )}

                <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-medium">{TEXT.membersTitle}</h4>
                    {card.members.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {TEXT.membersEmpty}
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[40rem] text-left">
                                <tbody>
                                    {card.members.map(member => (
                                        <CabinetMemberRow
                                            key={member.id}
                                            portalId={portalId}
                                            member={member}
                                            onLink={setLink}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {card.clientId !== null && (
                    <div className="border-t pt-4">
                        <CabinetAddMemberForm portalId={portalId} onLink={setLink} />
                    </div>
                )}

                <div className="border-t pt-4">
                    <CabinetTelegramList
                        portalId={portalId}
                        bindings={card.telegram}
                    />
                </div>
            </div>
        </SectionCard>
    );
};
