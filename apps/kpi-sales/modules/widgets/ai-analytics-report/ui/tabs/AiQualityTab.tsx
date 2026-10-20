'use client';

import { AiRopMarkCard } from '../AiRopMarkCard';
import { AiTypesMatrixBlock } from '../AiTypesMatrixBlock';
import { AiSectionsMatrixBlock } from '../AiSectionsMatrixBlock';
import { AiKpiOnlyNote } from '../components/AiKpiOnlyNote';

interface AiQualityTabProps {
    /** В kpi-only разборов нет — матриц и подбора недели нет. */
    kpiOnly: boolean;
}

/**
 * Подвкладка «Качество звонков»: три звонка недели для проверки
 * руководителем, матрицы «AI: типы звонков» и «AI: разделы оценки по
 * типу»; разбор по типам открывается из них вторым уровнем.
 */
export const AiQualityTab = ({ kpiOnly }: AiQualityTabProps) => {
    if (kpiOnly) return <AiKpiOnlyNote />;
    return (
        <>
            <AiRopMarkCard />
            <AiTypesMatrixBlock />
            <AiSectionsMatrixBlock />
        </>
    );
};
