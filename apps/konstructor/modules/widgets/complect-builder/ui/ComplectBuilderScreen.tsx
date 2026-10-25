'use client';

import { SlidersHorizontal } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';
import { ChoiceChips } from '@workspace/april-ui/fields';
import { Button } from '@workspace/ui/components/button';
import { BuildSummary } from '@/modules/features/build-summary';
import { ComplectDescriptionButton } from '@/modules/features/complect-description';
import { CompositionEditorPanel } from '@/modules/features/composition-editor';
import { FlowSummary } from '@/modules/features/flow-summary';
import { Screen, ScreenHeader, ScreenSplit } from '@/modules/shared';
import { useComplectBuilder } from '../hooks/use-complect-builder';

/**
 * Шаг 2 (легаси KONSTRUCTOR): комплекты — узкой полосой чипов под заголовком,
 * основное место — наполнению; справа итог, «Описание комплекта» (DOCX по
 * наполнению, решение 9) и переход к ценам. Во всю ширину фрейма: категорий
 * наполнения много.
 */
export const ComplectBuilderScreen = () => {
    const builder = useComplectBuilder();

    if (!builder.mainRow) {
        return (
            <Screen width="narrow">
                <EmptyState
                    icon={SlidersHorizontal}
                    title="Сначала основные параметры"
                    description="Комплекты зависят от региона, линейки и вида доступа."
                    actions={
                        <Button onClick={builder.toParams}>К параметрам</Button>
                    }
                />
            </Screen>
        );
    }

    return (
        <Screen width="full" className="gap-4">
            <ScreenHeader
                title="Комплект"
                description="Выберите комплект и настройте наполнение."
            />
            <ChoiceChips
                options={builder.complectOptions}
                value={builder.currentComplectCode}
                onChange={builder.selectComplect}
                ariaLabel="Комплект"
                collapseBelow="md"
            />
            <ScreenSplit
                aside={
                    <FlowSummary title="Итог" actions={<ComplectDescriptionButton />}>
                        <BuildSummary />
                    </FlowSummary>
                }
            >
                <CompositionEditorPanel row={builder.mainRow} />
            </ScreenSplit>
        </Screen>
    );
};
