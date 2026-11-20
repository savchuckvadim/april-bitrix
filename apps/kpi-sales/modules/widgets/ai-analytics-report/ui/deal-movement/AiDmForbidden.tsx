'use client';

import { Lock } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui';
import { AI_DEAL_MOVEMENT_TEXT } from '../../lib/deal-movement/ai-deal-movement.texts';

const T = AI_DEAL_MOVEMENT_TEXT.state;

/** Ответ 403: раздел только руководителям — без «Повторить». */
export const AiDmForbidden = () => (
    <EmptyState
        icon={Lock}
        tone="warning"
        title={T.forbidden}
        description={T.forbiddenHint}
    />
);
