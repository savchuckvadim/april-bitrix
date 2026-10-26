'use client';

import { FlaskConical } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';
import { DEV_PLACEMENT_HINT } from '../consts/app-global';

/**
 * Dev вне фрейма Bitrix без тестового портала/сделки в env: приложение не
 * угадывает портал (реальные сделки для dev закрыты), а объясняет, что задать.
 */
export const DevPlacementScreen = () => (
    <EmptyState
        layout="screen"
        icon={FlaskConical}
        tone="warning"
        title="Dev-режим не настроен"
        description={DEV_PLACEMENT_HINT}
    />
);
