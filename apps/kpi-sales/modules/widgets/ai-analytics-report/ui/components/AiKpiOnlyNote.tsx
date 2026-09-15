'use client';

import { SectionCard } from '@workspace/april-ui';

/** kpi-only: разборов нет — секции с оценками скрыты, объясняем почему. */
export const AiKpiOnlyNote = () => (
    <SectionCard density="compact" title="Оценок пока нет">
        <p className="text-sm text-muted-foreground">
            За последние 30 дней разборов звонков не было, поэтому пульс,
            «Внимание», повестка и таблица сигналов не считаются. Как только
            конвейер разбора заработает, секции появятся сами — данные KPI и
            финансов доступны на соседних вкладках.
        </p>
    </SectionCard>
);
