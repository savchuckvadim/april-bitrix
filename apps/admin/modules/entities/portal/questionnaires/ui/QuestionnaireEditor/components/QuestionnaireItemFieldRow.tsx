'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { Link2, RefreshCw } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type {
    PortalQuestionnaireItemSave,
    PortalQuestionnaireSchema,
} from '../../../model';
import { QUESTIONNAIRE_CODE } from '../../../model';
import { getFieldStatusProblem } from '../../../lib/item-editor-view';
import { optionName } from '../../../lib/questionnaire-list-view';

interface QuestionnaireItemFieldRowProps {
    item: PortalQuestionnaireItemSave;
    schema: PortalQuestionnaireSchema | undefined;
    onPick: () => void;
    /** Перечитать поле из Битрикса; пусто — кнопки не будет. */
    onSync?: () => void;
    isSyncing?: boolean;
}

/**
 * Привязка вопроса к полю — карточки CRM либо элемента смарта.
 *
 * Имя поля показывается ровно так, как его вернул Битрикс, и руками не
 * набирается: собранное конкатенацией имя привело бы к ответу, который
 * уходит в никуда. Поле выбирают в пикере — там же видно, годится ли оно.
 *
 * Состояние привязки (`Поле сменило тип`, `Поля больше нет`) приезжает от
 * сверки с живым Битриксом и подписывается названием из реестра. Сломанную
 * привязку объясняем прямо здесь, в карточке вопроса: из каталога фрейма
 * такой вопрос выпадает целиком, и по общему итогу в шапке понять, какой
 * именно вопрос перестал работать, нельзя.
 */
export const QuestionnaireItemFieldRow = ({
    item,
    schema,
    onPick,
    onSync,
    isSyncing = false,
}: QuestionnaireItemFieldRowProps) => {
    const problem = getFieldStatusProblem(item, schema);
    // Подпись зависит от канала: поле смарта лежит не в карточке CRM, и
    // называть его «Поле CRM» значило бы соврать про адрес ответа.
    const label =
        item.channel === QUESTIONNAIRE_CODE.channel.smart
            ? QUESTIONNAIRE_EDITOR_TEXT.itemSmartFieldLabel
            : QUESTIONNAIRE_EDITOR_TEXT.itemFieldLabel;

    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <div className="flex flex-wrap items-center gap-2">
                {item.fieldName ? (
                    <>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                            {item.fieldName}
                        </code>
                        {item.fieldType && (
                            <Badge variant="secondary">{item.fieldType}</Badge>
                        )}
                        {item.fieldSource && (
                            <Badge variant="outline">
                                {optionName(
                                    schema?.targetEntities,
                                    item.fieldSource,
                                )}
                            </Badge>
                        )}
                        {problem && (
                            <Badge variant="destructive">{problem.label}</Badge>
                        )}
                    </>
                ) : (
                    <span className="text-sm text-muted-foreground">
                        {QUESTIONNAIRE_EDITOR_TEXT.itemFieldEmpty}
                    </span>
                )}

                <Button variant="outline" size="sm" onClick={onPick}>
                    <Link2 className="h-4 w-4" />
                    {item.fieldName
                        ? QUESTIONNAIRE_EDITOR_TEXT.repickField
                        : QUESTIONNAIRE_EDITOR_TEXT.pickField}
                </Button>

                {/* Поле поправили в портале — правда там: подпись, тип и
                    значения списка перечитываются из Битрикса, а код
                    вопроса остаётся прежним (это ключ собранных ответов). */}
                {onSync && item.fieldName && item.fieldSource && (
                    <Button
                        variant="ghost"
                        size="sm"
                        title={QUESTIONNAIRE_EDITOR_TEXT.syncFieldHint}
                        disabled={isSyncing}
                        onClick={onSync}
                    >
                        <RefreshCw
                            className={cn(
                                'h-4 w-4',
                                isSyncing && 'animate-spin',
                            )}
                        />
                        {isSyncing
                            ? QUESTIONNAIRE_EDITOR_TEXT.syncFieldPending
                            : QUESTIONNAIRE_EDITOR_TEXT.syncField}
                    </Button>
                )}
            </div>

            {/* Бэйдж называет состояние, а эта строка — его последствие:
                вопрос менеджеру не покажется, и владелец должен понимать
                почему, не сверяясь с общим итогом сверки. */}
            {problem && (
                <p className="text-xs text-destructive">{problem.reason}</p>
            )}
        </div>
    );
};
