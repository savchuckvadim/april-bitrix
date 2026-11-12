import type { ClientOverview, ClientOverviewPortal } from '@/modules/entities/client';
import type { GuideCheck, GuideLinkItem } from '@/modules/shared/ui/guide';

/** Вкладка «Кабинет» портала — там владелец, доступы и ссылки на пароль. */
export const portalCabinetHref = (portalId: number): string => `/portal/${portalId}/cabinet`;

const domainOf = (portal: ClientOverviewPortal): string => portal.domain ?? `портал #${portal.portalId}`;

/** Первый портал, где пункт не сделан, — туда и ведёт ссылка. */
const firstLink = (portals: readonly ClientOverviewPortal[]): GuideLinkItem | null => {
    const portal = portals[0];
    return portal ? { title: `${domainOf(portal)} → «Кабинет»`, href: portalCabinetHref(portal.portalId) } : null;
};

const check = (
    key: string,
    title: string,
    done: boolean,
    hint: string,
    link: GuideLinkItem | null,
): GuideCheck => ({ key, title, status: done ? 'done' : 'todo', hint, link: done ? null : link });

/**
 * «Что сделать» по клиенту: портал привязан → у каждого портала владелец →
 * владелец задал пароль → заявки разобраны → Telegram привязан (туда
 * придут отчёты). Не сделано — где это сделать.
 */
export function clientChecklist(overview: ClientOverview): GuideCheck[] {
    const portals = overview.portals;
    const noOwner = portals.filter(portal => !portal.owner);
    const noPassword = portals.filter(portal => portal.owner && !portal.owner.hasPassword);
    const pending = portals.filter(portal => portal.pending > 0);
    const noTelegram = portals.filter(portal => portal.telegram === 0);

    return [
        check(
            'portal',
            'Портал привязан',
            portals.length > 0,
            portals.length
                ? `Порталов: ${portals.length}.`
                : 'Откройте портал → вкладка «Кабинет» → выберите эту организацию → «Привязать». Или ниже — «Привязать портал».',
            null,
        ),
        check(
            'owner',
            'У каждого портала есть владелец',
            portals.length > 0 && noOwner.length === 0,
            noOwner.length
                ? `Без владельца: ${noOwner.map(domainOf).join(', ')}. «Кабинет» → «Дать доступ» — первый участник станет владельцем.`
                : 'Владелец раздаёт доступы сотрудникам сам.',
            firstLink(noOwner),
        ),
        check(
            'password',
            'Владелец задал пароль',
            portals.length > 0 && noOwner.length === 0 && noPassword.length === 0,
            noPassword.length
                ? `Пароль не задан: ${noPassword.map(p => p.owner?.name ?? domainOf(p)).join(', ')}. «Кабинет» → у владельца «Ссылка на пароль» → «Скопировать» и передать лично.`
                : 'Владелец входит на сайте кабинета.',
            firstLink(noPassword.length ? noPassword : noOwner),
        ),
        check(
            'pending',
            'Заявки на доступ разобраны',
            pending.length === 0,
            pending.length
                ? `Ждут подтверждения: ${pending.map(p => `${domainOf(p)} — ${p.pending}`).join(', ')}.`
                : 'Новых заявок нет.',
            firstLink(pending),
        ),
        check(
            'telegram',
            'Telegram привязан',
            portals.length > 0 && noTelegram.length < portals.length,
            'Сотрудник клиента в приложении April или в кабинете на сайте нажимает «Привязать Telegram» — туда придут отчёты и уведомления.',
            firstLink(noTelegram),
        ),
    ];
}
