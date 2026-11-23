'use client';

import { Spinner } from '@workspace/april-ui/feedback';
import type { SpecificationView } from '../hooks/use-specification-view';
import { SpecificationDetails } from './SpecificationDetails';
import { SpecificationField } from './SpecificationField';
import { SpecificationSums } from './SpecificationSums';

export interface SpecificationEditorProps {
    spec: SpecificationView;
    /** Префикс id полей: у каждой договорной единицы свой */
    idPrefix?: string;
}

/**
 * Редактор спецификации договора: суммы, основные строки и состав комплекта.
 * Общий для живого договора и для договорных единиц, значения и правки
 * приходят в `spec`.
 */
export const SpecificationEditor = ({ spec, idPrefix }: SpecificationEditorProps) =>
    spec.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="sm" />
            Собираю спецификацию…
        </div>
    ) : (
        <div className="flex flex-col gap-3">
            <SpecificationSums sums={spec.sums} />
            {spec.items.map(item => (
                <SpecificationField key={item.code} item={item} onChange={spec.setValue} idPrefix={idPrefix} />
            ))}
            <SpecificationDetails
                sections={spec.sections}
                open={spec.isExpanded}
                onOpenChange={spec.setExpanded}
                onChange={spec.setValue}
                idPrefix={idPrefix}
            />
        </div>
    );
