'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { useComplectVariants } from '../hooks/use-complect-variants';
import { useVariantsPanelOpen } from '../hooks/use-variants-panel-open';
import { ComplectVariantCreateForm } from './ComplectVariantCreateForm';
import { ComplectVariantRow } from './ComplectVariantRow';
import { ComplectVariantSettings } from './ComplectVariantSettings';

/**
 * Варианты комплекта сделки: собрать несколько предложений и задать, какие из
 * них идут в документы: по одному (открытый вариант) или вместе. Мерджа здесь
 * нет — только выбор. Панель свёрнута по умолчанию, чтобы длинный список не
 * занимал место на «Ценах»: в шапке видно число вариантов и тот, что сейчас
 * редактируется, ошибка тоже остаётся на виду.
 */
export const ComplectVariantPanel = () => {
    const variants = useComplectVariants();
    const panel = useVariantsPanelOpen();

    if (!variants.hasSmart) return null;

    const { records } = variants;

    return (
        <SectionCard
            density="compact"
            collapsible
            open={panel.open}
            onOpenChange={panel.setOpen}
            title={`Варианты комплекта (${records.length})`}
            description={
                variants.error ? (
                    <span className="text-destructive">{variants.error}</span>
                ) : (
                    variants.editingSummary
                )
            }
        >
            <ComplectVariantCreateForm variants={variants} />

            {!records.length ? (
                <span className="text-xs text-muted-foreground">
                    Вариантов пока нет. Соберите комплект и сохраните его как
                    вариант — потом можно будет собрать ещё и выбрать из них.
                </span>
            ) : null}

            {records.map(record => (
                <ComplectVariantRow key={record.id} record={record} variants={variants} />
            ))}

            {records.length > 1 ? <ComplectVariantSettings variants={variants} /> : null}
        </SectionCard>
    );
};
