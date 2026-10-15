'use client';

import { ToneBadge, type ToneBadgeSize } from '@workspace/april-ui/badges';
import {
    HOOK_KIND_LABEL,
    HOOKS_TEXT,
    type HookBadgeView,
} from '../../consts/hooks.const';
import {
    resolveEnabledBadge,
    resolveReadinessBadge,
} from '../../lib/hooks-view';
import type { HookCron, HookKind, PortalHookReadiness } from '../../model';

interface HookBadgeProps {
    badge: HookBadgeView;
    size?: ToneBadgeSize;
    title?: string;
}

/** Бэйдж из пары «подпись + тон» (статусы, рубильник, операции). */
export const HookBadge = ({ badge, size = 'md', title }: HookBadgeProps) => (
    <ToneBadge tone={badge.tone} variant="soft" size={size} title={title}>
        {badge.label}
    </ToneBadge>
);

interface HookKindBadgeProps {
    kind: HookKind;
    size?: ToneBadgeSize;
}

export const HookKindBadge = ({ kind, size = 'md' }: HookKindBadgeProps) => (
    <ToneBadge tone="neutral" variant="outline" size={size}>
        {HOOK_KIND_LABEL[kind]}
    </ToneBadge>
);

interface HookCronBadgeProps {
    cron: HookCron;
    size?: ToneBadgeSize;
}

/** Расписание крона; замечания (лок, лимиты) — в подсказке. */
export const HookCronBadge = ({ cron, size = 'md' }: HookCronBadgeProps) => (
    <ToneBadge
        tone="info"
        variant="soft"
        size={size}
        title={cron.note ?? cron.name}
    >
        {cron.schedule}
    </ToneBadge>
);

interface HookReadinessBadgesProps {
    readiness: Pick<PortalHookReadiness, 'status' | 'enabled'>;
    size?: ToneBadgeSize;
}

/** Статус установки + рубильник хука на портале. */
export const HookReadinessBadges = ({
    readiness,
    size = 'md',
}: HookReadinessBadgesProps) => {
    const enabled = resolveEnabledBadge(readiness.enabled);
    return (
        <>
            <HookBadge
                badge={resolveReadinessBadge(readiness.status)}
                size={size}
                title={HOOKS_TEXT.readinessOnPortal}
            />
            {enabled && <HookBadge badge={enabled} size={size} />}
        </>
    );
};
