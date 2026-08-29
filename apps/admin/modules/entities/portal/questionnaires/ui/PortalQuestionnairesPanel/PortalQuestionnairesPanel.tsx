'use client';

import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { Plus } from 'lucide-react';
import { ConfirmDialog } from '@/modules/shared/ui';
import {
    QUESTIONNAIRES_TEXT,
    QUESTIONNAIRE_MATRIX_TEXT,
    QUESTIONNAIRE_NEW_ID,
    QUESTIONNAIRE_VIEW,
} from '../../consts/questionnaires.const';
import type { QuestionnaireView } from '../../consts/questionnaires.const';
import { useQuestionnairesScreen } from '../../lib/hooks/use-questionnaires-screen';
import { QuestionnaireListTable } from './components/QuestionnaireListTable';
import { QuestionnaireMatrixView } from './components/QuestionnaireMatrixView';

interface PortalQuestionnairesPanelProps {
    portalId: number;
}

/**
 * Каталог анкет портала — двумя видами.
 *
 * Основной вид — матрица: строки типов событий против назначений анкет,
 * то есть прямой ответ на вопрос владельца «что спросят у менеджера, когда
 * он отчитается по Решению». Плоский список остаётся вторым видом: код,
 * приложение, дата обновления и действия над строкой есть только в нём.
 *
 * Всё, что не вёрстка, живёт в `useQuestionnairesScreen`; подписи
 * назначений, типов событий и условий приходят из реестра `GET /schema` —
 * админка не хардкодит ни одного кода.
 */
export const PortalQuestionnairesPanel = ({
    portalId,
}: PortalQuestionnairesPanelProps) => {
    const {
        rows,
        matrix,
        view,
        setView,
        isSchemaError,
        isLoading,
        isDetailsLoading,
        isListError,
        toggleActive,
        togglingId,
        toggleEventType,
        isEventSwitchReady,
        isEventSwitchSaving,
        checkFields,
        checkingId,
        checkSummaries,
        removeTarget,
        askRemove,
        confirmRemove,
        isRemoving,
    } = useQuestionnairesScreen(portalId);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
                <div className="max-w-2xl">
                    <h1 className="text-lg font-semibold">
                        {QUESTIONNAIRES_TEXT.title}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {QUESTIONNAIRES_TEXT.subtitle}
                    </p>
                </div>
                {/* Создание и правка — один и тот же редактор: у новой
                    анкеты просто нет идентификатора. Без предустановки:
                    назначение и условие владелец задаст сам — из матрицы
                    их проставляет клетка. */}
                <Button asChild>
                    <Link
                        href={`/portal/${portalId}/questionnaires/${QUESTIONNAIRE_NEW_ID}`}
                    >
                        <Plus className="h-4 w-4" />
                        {QUESTIONNAIRES_TEXT.create}
                    </Link>
                </Button>
            </div>

            {/* Реестр — источник всех подписей: без него ни матрицу
                разложить, ни переключатель проверить. */}
            {isSchemaError && (
                <p className="text-destructive text-sm">
                    {QUESTIONNAIRES_TEXT.schemaLoadError}
                </p>
            )}

            {isListError ? (
                <p className="text-destructive text-sm">
                    {QUESTIONNAIRES_TEXT.loadError}
                </p>
            ) : (
                <Tabs
                    value={view}
                    onValueChange={value => setView(value as QuestionnaireView)}
                >
                    <TabsList>
                        <TabsTrigger
                            value={QUESTIONNAIRE_VIEW.matrix}
                            title={QUESTIONNAIRE_MATRIX_TEXT.viewMatrixHint}
                        >
                            {QUESTIONNAIRE_MATRIX_TEXT.viewMatrix}
                        </TabsTrigger>
                        <TabsTrigger
                            value={QUESTIONNAIRE_VIEW.list}
                            title={QUESTIONNAIRE_MATRIX_TEXT.viewListHint}
                        >
                            {QUESTIONNAIRE_MATRIX_TEXT.viewList}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={QUESTIONNAIRE_VIEW.matrix}>
                        {/* Матрица держится на условиях, а они приезжают
                            вместе с составом: до его ответа раскладывать
                            нечего. */}
                        <QuestionnaireMatrixView
                            portalId={portalId}
                            matrix={matrix}
                            isLoading={isLoading || isDetailsLoading}
                            isSwitchReady={isEventSwitchReady}
                            isSwitchSaving={isEventSwitchSaving}
                            onToggleEventType={toggleEventType}
                        />
                    </TabsContent>

                    <TabsContent value={QUESTIONNAIRE_VIEW.list}>
                        <QuestionnaireListTable
                            portalId={portalId}
                            rows={rows}
                            isLoading={isLoading}
                            togglingId={togglingId}
                            onToggle={toggleActive}
                            checkingId={checkingId}
                            checkSummaries={checkSummaries}
                            onCheck={checkFields}
                            onRemove={askRemove}
                        />
                    </TabsContent>
                </Tabs>
            )}

            <ConfirmDialog
                open={!!removeTarget}
                onOpenChange={open => {
                    if (!open) askRemove(null);
                }}
                title={QUESTIONNAIRES_TEXT.removeTitle}
                description={QUESTIONNAIRES_TEXT.removeDescription}
                confirmLabel={QUESTIONNAIRES_TEXT.remove}
                cancelLabel={QUESTIONNAIRES_TEXT.cancel}
                variant="destructive"
                isLoading={isRemoving}
                onConfirm={confirmRemove}
            />
        </div>
    );
};
