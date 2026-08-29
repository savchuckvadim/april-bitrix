'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import {
    QUESTIONNAIRES_TEXT,
    QUESTIONNAIRE_EDITOR_TEXT,
} from '../../../consts/questionnaires.const';
import type {
    PortalQuestionnaireCondition,
    PortalQuestionnaireSchema,
    QuestionnaireField,
} from '../../../model';
import type { QuestionnaireFieldOrigin } from '../../../lib/build-item-from-field';
import { useFieldPicker } from '../../../lib/hooks/use-field-picker';
import { Plus } from 'lucide-react';
import { QuestionnaireFieldCreatePanel } from './QuestionnaireFieldCreatePanel';
import { QuestionnaireFieldPickerFilters } from './QuestionnaireFieldPickerFilters';
import { QuestionnaireFieldPickerNotices } from './QuestionnaireFieldPickerNotices';
import { QuestionnaireFieldPickerTable } from './QuestionnaireFieldPickerTable';

interface QuestionnaireFieldPickerDialogProps {
    open: boolean;
    portalId: number;
    domain: string | undefined;
    schema: PortalQuestionnaireSchema | undefined;
    /**
     * Условия показа анкеты: от них зависит, доступны ли поля смарта —
     * ответ уедет в элемент, который заводит поток события.
     */
    conditions: PortalQuestionnaireCondition[];
    /** Замена поля у одного вопроса: несколько полей тут не имеют смысла. */
    isSingle: boolean;
    onOpenChange: (open: boolean) => void;
    onApply: (
        fields: QuestionnaireField[],
        origin: QuestionnaireFieldOrigin,
    ) => void;
}

/**
 * Пикер полей — то самое «выбираем поле из существующих».
 *
 * Владелец сам заводит поля в карточке компании, сделки или смарта; здесь
 * он выбирает их из живого Битрикса, а не переписывает UF-имена руками.
 * Список показывает и те поля, которые взять нельзя, с причиной: молча
 * пропавшее поле выглядит как поломка админки.
 *
 * Ровно те же причины проверит бэк на сохранении: множественное поле, тип,
 * который анкета не заполняет, список без идентификаторов элементов — и
 * смарт, до элемента которого ответу не добраться. Плашка над списком
 * говорит, куда уедет ответ выбранного смарта либо почему не уедет.
 */
export const QuestionnaireFieldPickerDialog = ({
    open,
    portalId,
    domain,
    schema,
    conditions,
    isSingle,
    onOpenChange,
    onApply,
}: QuestionnaireFieldPickerDialogProps) => {
    const picker = useFieldPicker({
        portalId,
        domain,
        schema,
        conditions,
        single: isSingle,
    });
    const selectedCount = picker.selectedFields.length;
    /**
     * Форма создания поля: открывается по кнопке и живёт панелью внутри
     * пикера. Вторая модалка поверх первой убрала бы из виду носителя,
     * ради которого владелец сюда и пришёл.
     */
    const [isCreateOpen, setCreateOpen] = useState(false);

    /**
     * Поле заведено — вопрос собирается прямо из ответа: бэк вернул его в
     * том же виде, что и список выбора, и второй заход в Битрикс за ним не
     * нужен.
     */
    const applyCreated = (field: QuestionnaireField) => {
        setCreateOpen(false);
        if (picker.origin) onApply([field], picker.origin);
    };

    const apply = () => {
        if (!picker.origin || selectedCount === 0) return;
        onApply(
            isSingle
                ? picker.selectedFields.slice(0, 1)
                : picker.selectedFields,
            picker.origin,
        );
        picker.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] max-w-5xl overflow-hidden">
                <DialogHeader>
                    <DialogTitle>
                        {QUESTIONNAIRE_EDITOR_TEXT.pickerTitle}
                    </DialogTitle>
                    <DialogDescription>
                        {QUESTIONNAIRE_EDITOR_TEXT.pickerDescription}
                    </DialogDescription>
                </DialogHeader>

                {!domain ? (
                    <p className="text-sm text-destructive">
                        {QUESTIONNAIRES_TEXT.noDomain}
                    </p>
                ) : (
                    <div className="space-y-3 overflow-y-auto">
                        <QuestionnaireFieldPickerFilters
                            sources={picker.sourceOptions}
                            sourceKey={picker.sourceKey}
                            search={picker.search}
                            onlyManual={picker.onlyManual}
                            onSelectSource={picker.selectSource}
                            onSearchChange={picker.setSearch}
                            onOnlyManualChange={picker.setOnlyManual}
                        />

                        <QuestionnaireFieldPickerNotices
                            sourceNotice={picker.sourceNotice}
                            degradedNotice={picker.degradedNotice}
                        />

                        {/* Нужного поля в носителе может не быть вовсе —
                            тогда его заводят отсюда, не уходя в карточку
                            смарта и обратно. */}
                        {!isCreateOpen && (
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCreateOpen(true)}
                                >
                                    <Plus className="h-4 w-4" />
                                    {QUESTIONNAIRE_EDITOR_TEXT.createFieldOpen}
                                </Button>
                            </div>
                        )}

                        {isCreateOpen && (
                            <QuestionnaireFieldCreatePanel
                                portalId={portalId}
                                domain={domain}
                                schema={schema}
                                source={picker.source}
                                sourceBlockReason={picker.sourceBlockReason}
                                isDegraded={picker.isDegraded}
                                onClose={() => setCreateOpen(false)}
                                onCreated={applyCreated}
                            />
                        )}

                        {picker.isLoading ? (
                            <p className="text-sm text-muted-foreground">
                                {QUESTIONNAIRES_TEXT.loading}
                            </p>
                        ) : picker.isError ? (
                            <p className="text-sm text-destructive">
                                {QUESTIONNAIRES_TEXT.fieldsLoadError}
                            </p>
                        ) : picker.rows.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {picker.onlyManual
                                    ? QUESTIONNAIRE_EDITOR_TEXT.pickerEmptyManual
                                    : QUESTIONNAIRE_EDITOR_TEXT.pickerEmpty}
                            </p>
                        ) : (
                            <div className="max-h-[45vh] overflow-y-auto rounded-lg border">
                                <QuestionnaireFieldPickerTable
                                    rows={picker.rows}
                                    selected={picker.selected}
                                    onToggle={picker.toggle}
                                />
                            </div>
                        )}

                        {/* Носитель, у которого нельзя взять ни одного поля,
                            выглядел бы как пустой список — говорим прямо.
                            Запрет на весь носитель уже сказан плашкой
                            выше, повторять его строкой незачем. */}
                        {picker.rows.length > 0 &&
                            picker.selectableCount === 0 &&
                            picker.sourceNotice?.tone !== 'warning' && (
                                <p className="text-sm text-destructive">
                                    {
                                        QUESTIONNAIRE_EDITOR_TEXT.pickerSelectableNone
                                    }
                                </p>
                            )}
                    </div>
                )}

                <DialogFooter className="items-center gap-2 sm:justify-between">
                    <span className="text-xs text-muted-foreground">
                        {selectedCount === 0
                            ? QUESTIONNAIRE_EDITOR_TEXT.pickerSelectedNone
                            : `${QUESTIONNAIRE_EDITOR_TEXT.pickerSelectedCount}: ${selectedCount}`}
                    </span>
                    <span className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                        >
                            {QUESTIONNAIRES_TEXT.cancel}
                        </Button>
                        <Button disabled={selectedCount === 0} onClick={apply}>
                            {isSingle
                                ? QUESTIONNAIRE_EDITOR_TEXT.pickerReplace
                                : `${QUESTIONNAIRE_EDITOR_TEXT.pickerAdd} (${selectedCount})`}
                        </Button>
                    </span>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
