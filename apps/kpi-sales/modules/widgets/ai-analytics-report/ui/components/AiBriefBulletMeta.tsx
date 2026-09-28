'use client';

import { ToneBadge } from '@workspace/april-ui';
import { AI_ALERT_OPEN_LINK_LABEL } from '@/modules/entities/ai-analytics';
import { useAiManagerName } from '../../hooks/use-ai-manager-name';
import {
    showsAiBriefManagerChip,
    type AiBriefBulletView,
} from '../../lib/ai-brief-view.util';
import { AiCallTypeBadge } from './AiCallTypeBadge';
import { AiCardLink } from './AiCardLink';

interface AiBriefBulletMetaProps {
    bullet: AiBriefBulletView;
}

/**
 * Строка под текстом пункта: слово изменения к прошлому периоду, менеджер
 * (в группе «На кого смотреть» имя уже стоит над текстом), тип звонка и
 * ссылка «Открыть разбор».
 */
export const AiBriefBulletMeta = ({ bullet }: AiBriefBulletMetaProps) => {
    const managerName = useAiManagerName();

    return (
        <div className="flex flex-wrap items-center gap-2 text-xs">
            {bullet.deltaWord && (
                <ToneBadge tone="neutral" variant="soft" size="sm">
                    {bullet.deltaWord}
                </ToneBadge>
            )}
            {showsAiBriefManagerChip(bullet) && (
                <ToneBadge tone="muted" variant="soft" size="sm">
                    {managerName(bullet.managerId)}
                </ToneBadge>
            )}
            {bullet.callType && <AiCallTypeBadge code={bullet.callType} />}
            {bullet.link && (
                <AiCardLink
                    href={bullet.link}
                    label={AI_ALERT_OPEN_LINK_LABEL}
                />
            )}
        </div>
    );
};
