import Link from 'next/link';
import { SectionCard } from '@workspace/april-ui/surfaces';
import type { ClientOverviewPerson } from '@/modules/entities/client';
import { portalCabinetHref } from '../lib/client-checklist';

const ROLE_TITLE: Record<string, string> = {
    owner: 'владелец',
    member: 'участник',
};

/** Люди организации с доступом к кабинетам: кто, где и с какой ролью. */
export const ClientPeopleCard = ({ people }: { people: ClientOverviewPerson[] }) => (
    <SectionCard
        title="Люди"
        description="Учётки кабинета организации. Выдать, снять доступ или сменить владельца — во вкладке «Кабинет» портала."
    >
        {people.length === 0 ? (
            <p className="text-sm text-muted-foreground">
                Доступов пока нет — на портале «Кабинет» → «Дать доступ».
            </p>
        ) : (
            <ul className="space-y-2">
                {people.map(person => (
                    <li key={person.userId} className="text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{person.name}</span>
                            {person.email && <span className="text-muted-foreground">{person.email}</span>}
                            <span className={person.hasPassword ? 'text-xs text-muted-foreground' : 'text-xs text-warning'}>
                                {person.hasPassword ? 'пароль задан' : 'пароль не задан'}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {person.portals.map((portal, index) => (
                                <span key={portal.portalId}>
                                    {index > 0 ? ', ' : ''}
                                    <Link href={portalCabinetHref(portal.portalId)} className="hover:underline">
                                        {portal.domain ?? `портал #${portal.portalId}`}
                                    </Link>{' '}
                                    — {ROLE_TITLE[portal.role] ?? portal.role}
                                </span>
                            ))}
                        </p>
                    </li>
                ))}
            </ul>
        )}
    </SectionCard>
);
