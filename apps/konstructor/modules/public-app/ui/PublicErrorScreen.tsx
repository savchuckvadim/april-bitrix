'use client';

import { CloudOff } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';
import { Button } from '@workspace/ui/components/button';

/** Каталог не загрузился, а про саму ссылку ничего плохого не известно. */
export const PublicErrorScreen = ({ onRetry }: { onRetry: () => void }) => (
    <EmptyState
        icon={CloudOff}
        layout="screen"
        title="Не удалось загрузить конструктор"
        description="Проверьте соединение и попробуйте ещё раз."
        actions={<Button onClick={onRetry}>Повторить</Button>}
    />
);
