'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { useComplectVariants } from '../hooks/use-complect-variants';
import { useVariantsPanelOpen } from '../hooks/use-variants-panel-open';
import { ComplectVariantCreateForm } from './ComplectVariantCreateForm';
import { ComplectVariantRow } from './ComplectVariantRow';

/**
 * Варианты комплекта сделки: собрать несколько предложений и переключаться
 * между ними (открыть, создать, удалить, вернуть отклонённый). КП делается по
 * открытому варианту; какие варианты идут в договор и отчёт о поставке,
 * выбирают на экранах договора и отчёта. Панель свёрнута по умолчанию, чтобы
 * длинный список не занимал место на «Ценах»: в шапке видно число вариантов и
 * тот, что сейчас редактируется, ошибка тоже остаётся на виду.
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
        </SectionCard>
    );
};
