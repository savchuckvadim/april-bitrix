'use client';

import { ToneBadge } from '@workspace/april-ui';
import { useAiCallTypeBadge } from '../../hooks/use-ai-call-type-badge';

interface AiCallTypeBadgeProps {
    code: string;
}

/** Бэйдж типа звонка: подпись и тон по карте алфавитов портала. */
export const AiCallTypeBadge = ({ code }: AiCallTypeBadgeProps) => {
    const { label, tone } = useAiCallTypeBadge()(code);

    return (
        <ToneBadge tone={tone} variant="outline" size="sm">
            {label}
        </ToneBadge>
    );
};
