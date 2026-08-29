'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { QuestionnaireEditor } from '@/modules/entities/portal/questionnaires';

/**
 * Редактор анкеты портала.
 *
 * Один и тот же экран и для создания (`/questionnaires/new`), и для правки:
 * анкета собирается целиком — шапка, условия показа и состав вопросов
 * рядом. Страница только достаёт идентификаторы из адреса.
 *
 * Suspense — из-за предустановки: в редактор приезжают назначение и условие
 * клетки матрицы (`?purpose=…&conditionKind=…&conditionValue=…`), а
 * `useSearchParams` без границы Suspense рендер страницы не проходит.
 */
export default function PortalQuestionnairePage() {
    const params = useParams<{ portalId: string; questionnaireId: string }>();
    const portalId = Number(params.portalId);

    if (!Number.isInteger(portalId) || portalId <= 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Некорректный id портала в адресе страницы.
            </p>
        );
    }

    return (
        <Suspense>
            <QuestionnaireEditor
                portalId={portalId}
                questionnaireId={params.questionnaireId}
            />
        </Suspense>
    );
}
