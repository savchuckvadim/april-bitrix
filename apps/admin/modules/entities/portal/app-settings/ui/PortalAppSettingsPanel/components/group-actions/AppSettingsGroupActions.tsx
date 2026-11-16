'use client';

import type { ComponentType } from 'react';
import { DEAL_AUDIT_GROUP_CODE } from '../../../../consts/deal-audit-run.const';
import { DealAuditRunNowAction } from './DealAuditRunNowAction';

interface GroupActionProps {
    portalId: number;
}

/**
 * Действия категории настроек: кнопки «сделать сейчас» рядом с полями,
 * которые это действие настраивают. Код категории — из схемы бэка
 * (`app-setting-groups.ts`).
 */
const GROUP_ACTIONS: Readonly<
    Partial<Record<string, ComponentType<GroupActionProps>>>
> = {
    [DEAL_AUDIT_GROUP_CODE]: DealAuditRunNowAction,
};

interface AppSettingsGroupActionsProps extends GroupActionProps {
    groupCode: string;
}

export const AppSettingsGroupActions = ({
    groupCode,
    portalId,
}: AppSettingsGroupActionsProps) => {
    const Action = GROUP_ACTIONS[groupCode];
    return Action ? <Action portalId={portalId} /> : null;
};
