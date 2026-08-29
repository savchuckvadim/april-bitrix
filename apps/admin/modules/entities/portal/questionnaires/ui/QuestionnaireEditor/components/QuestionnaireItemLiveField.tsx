'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type { PortalQuestionnaireItemSave } from '../../../model';
import { addLiveOptionToItem } from '../../../lib/build-item-from-field';
import {
    acceptLiveFieldPatch,
    adoptLiveOptionTitlePatch,
    adoptLiveTitlePatch,
    buildLiveFieldView,
} from '../../../lib/field-mirror';
import { formatUpdatedAt } from '../../../lib/questionnaire-list-view';
import { QuestionnaireLiveOptionRow } from './QuestionnaireLiveOptionRow';

interface QuestionnaireItemLiveFieldProps {
    item: PortalQuestionnaireItemSave;
    onPatch: (patch: Partial<PortalQuestionnaireItemSave>) => void;
}

/**
 * Правда портала рядом с нашим текстом: как поле выглядит в Битриксе.
 *
 * Считается по слепку в `meta` вопроса, а не отдельным запросом: живое
 * состояние пишет сверка, а она идёт сама при каждом открытии анкеты.
 * Поэтому блок виден ВСЕГДА — и новые значения справочника тоже, а не
 * после нажатия «Проверить привязки».
 *
 * Что здесь тревога, а что нет. Разница между формулировкой вопроса и
 * подписью поля — норма («Дата решения» в карточке против «Когда клиент
 * примет решение?» в анкете), и она написана мелким шрифтом. Тревога —
 * «переименовали в Битриксе»: подпись сменилась уже ПОСЛЕ того, как
 * владелец её принял. Отличить одно от другого можно только по слепку,
 * ради этого он и заведён.
 */
export const QuestionnaireItemLiveField = ({
    item,
    onPatch,
}: QuestionnaireItemLiveFieldProps) => {
    const view = buildLiveFieldView(item);
    // Слепка нет: поле не привязано либо его ни разу не читали — врать про
    // состояние портала нечем.
    if (!view) return null;

    return (
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
            <div className="flex flex-wrap items-center gap-2">
                <Label>{QUESTIONNAIRE_EDITOR_TEXT.liveFieldTitle}</Label>
                <span className="text-sm">{`«${view.title}»`}</span>
                {view.type && <Badge variant="secondary">{view.type}</Badge>}
                {/* Когда это читали: слепок может быть и вчерашним —
                    сверка при открытии не проходит на грязном черновике. */}
                {view.at && (
                    <span className="text-xs text-muted-foreground">
                        {`${QUESTIONNAIRE_EDITOR_TEXT.liveFieldReadAt} ${formatUpdatedAt(view.at)}`}
                    </span>
                )}
            </div>

            <p className="text-xs text-muted-foreground">
                {QUESTIONNAIRE_EDITOR_TEXT.liveFieldHint}
            </p>

            {/* Переименование в портале: показываем прежнюю подпись — без
                неё «переименовали» ничем не отличается от «названо
                по-своему». Оба действия обновляют слепок принятого,
                поэтому строка больше не всплывёт. */}
            {view.renamedTitle && (
                <div className="flex flex-wrap items-center gap-2 rounded-md border border-primary/40 bg-primary/5 p-2">
                    <span className="text-sm">
                        {`${QUESTIONNAIRE_EDITOR_TEXT.liveFieldRenamed}: ${QUESTIONNAIRE_EDITOR_TEXT.liveFieldRenamedWas} «${view.renamedTitle.accepted}»`}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const patch = adoptLiveTitlePatch(item);
                            if (patch) onPatch(patch);
                        }}
                    >
                        {QUESTIONNAIRE_EDITOR_TEXT.liveFieldAdoptTitle}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        title={QUESTIONNAIRE_EDITOR_TEXT.liveFieldKeepTitleHint}
                        onClick={() => onPatch(acceptLiveFieldPatch(item))}
                    >
                        {QUESTIONNAIRE_EDITOR_TEXT.liveFieldKeepTitle}
                    </Button>
                </div>
            )}

            {/* Тип сменился — вопрос в каталог не уедет: контрол в такое
                поле не пишет. Правится выбором поля заново. */}
            {view.changedType && (
                <p className="text-xs text-destructive">
                    {`${QUESTIONNAIRE_EDITOR_TEXT.liveFieldTypeChanged}: ${view.changedType.live}, ${QUESTIONNAIRE_EDITOR_TEXT.liveFieldTypeOur} ${view.changedType.our}`}
                </p>
            )}

            {view.isTitleOurs && !view.renamedTitle && (
                <p className="text-xs text-muted-foreground">
                    {QUESTIONNAIRE_EDITOR_TEXT.liveFieldOurTitle}
                </p>
            )}

            {view.options.length > 0 && (
                <div className="space-y-1">
                    <Label>
                        {QUESTIONNAIRE_EDITOR_TEXT.liveFieldOptionsTitle}
                    </Label>
                    <ul className="space-y-1">
                        {view.options.map(option => (
                            <QuestionnaireLiveOptionRow
                                key={`${option.bitrixId ?? option.xmlId ?? option.title}`}
                                option={option}
                                onAdd={() =>
                                    onPatch(addLiveOptionToItem(item, option))
                                }
                                onAdoptTitle={() => {
                                    const patch = adoptLiveOptionTitlePatch(
                                        item,
                                        option,
                                    );
                                    if (patch) onPatch(patch);
                                }}
                            />
                        ))}
                    </ul>
                </div>
            )}

            {/* Исчезнувшие значения помечаем, но сами не трогаем: гасит их
                сверка, и уже собранные ответы остаются на месте. */}
            {view.lostOptions.length > 0 && (
                <div className="space-y-1">
                    <Label className="text-destructive">
                        {QUESTIONNAIRE_EDITOR_TEXT.liveFieldLostTitle}
                    </Label>
                    <ul className="flex flex-wrap gap-2">
                        {view.lostOptions.map(option => (
                            <li key={option.code}>
                                <Badge
                                    variant="destructive"
                                    title={
                                        QUESTIONNAIRE_EDITOR_TEXT.liveFieldLostHint
                                    }
                                >
                                    {option.title}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
