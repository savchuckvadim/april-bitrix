'use client';

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
    QUESTIONNAIRES_TEXT,
    QUESTIONNAIRE_EDITOR_TEXT,
} from '../../../consts/questionnaires.const';
import type {
    PortalQuestionnaireSchema,
    QuestionnaireField,
    QuestionnaireFieldSource,
} from '../../../model';
import { useFieldCreateForm } from '../../../lib/hooks/use-field-create-form';
import { QuestionnaireFieldCreateOptions } from './QuestionnaireFieldCreateOptions';

interface QuestionnaireFieldCreatePanelProps {
    portalId: number;
    domain: string | undefined;
    schema: PortalQuestionnaireSchema | undefined;
    /** Носитель, выбранный в пикере: в нём поле и заводится. */
    source: QuestionnaireFieldSource | undefined;
    /** Причина, по которой поля носителя недоступны целиком. */
    sourceBlockReason: string | null;
    /** Поля читались урезанным способом — прав администратора CRM нет. */
    isDegraded: boolean;
    onClose: () => void;
    onCreated: (field: QuestionnaireField) => void;
}

/**
 * «Создать поле» прямо в пикере.
 *
 * Раньше владелец уходил из админки в карточку смарта, заводил поле
 * руками и возвращался искать его в списке. Теперь поле заводится здесь,
 * а бэк возвращает его ровно в том виде, в каком отдаёт список выбора —
 * вопрос собирается сразу, без обновления и поиска.
 *
 * Панель, а не второе модальное окно: пикер уже открыт модалкой, и
 * вложенная модалка забрала бы у владельца из виду носителя, ради
 * которого он сюда пришёл.
 */
export const QuestionnaireFieldCreatePanel = ({
    portalId,
    domain,
    schema,
    source,
    sourceBlockReason,
    isDegraded,
    onClose,
    onCreated,
}: QuestionnaireFieldCreatePanelProps) => {
    const form = useFieldCreateForm({
        portalId,
        domain,
        schema,
        source,
        sourceBlockReason,
        isDegraded,
        onCreated,
    });
    const isLocked = form.isCreating;

    return (
        <section className="space-y-3 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-medium">
                        {source
                            ? `${QUESTIONNAIRE_EDITOR_TEXT.createFieldInSource} «${source.title}»`
                            : QUESTIONNAIRE_EDITOR_TEXT.createFieldTitle}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {QUESTIONNAIRE_EDITOR_TEXT.createFieldHint}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={isLocked}
                    onClick={onClose}
                >
                    {QUESTIONNAIRES_TEXT.cancel}
                </Button>
            </div>

            {/* Носитель, в котором писать нельзя, формой не спасти: причина
                та же, которой отказал бы Битрикс или бэк. */}
            {form.blockReason ? (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="text-sm font-medium">
                        {QUESTIONNAIRE_EDITOR_TEXT.createFieldBlocked}
                    </AlertTitle>
                    <AlertDescription className="text-xs text-muted-foreground">
                        {form.blockReason}
                    </AlertDescription>
                </Alert>
            ) : (
                <>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                            <Label>
                                {QUESTIONNAIRE_EDITOR_TEXT.createFieldLabel}
                            </Label>
                            <Input
                                value={form.draft.title}
                                disabled={isLocked}
                                placeholder={
                                    QUESTIONNAIRE_EDITOR_TEXT.createFieldLabelPlaceholder
                                }
                                onChange={event =>
                                    form.setTitle(event.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-1">
                            <Label>
                                {QUESTIONNAIRE_EDITOR_TEXT.createFieldCode}
                            </Label>
                            <Input
                                className="font-mono"
                                value={form.draft.code}
                                disabled={isLocked}
                                onChange={event =>
                                    form.setCode(event.target.value)
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                {QUESTIONNAIRE_EDITOR_TEXT.createFieldCodeHint}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <Label>
                                {QUESTIONNAIRE_EDITOR_TEXT.createFieldType}
                            </Label>
                            <Select
                                value={form.draft.type}
                                disabled={isLocked}
                                onValueChange={form.setType}
                            >
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={
                                            QUESTIONNAIRE_EDITOR_TEXT.createFieldType
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {form.types.map(option => (
                                        <SelectItem
                                            key={option.type}
                                            value={option.type}
                                        >
                                            {option.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {QUESTIONNAIRE_EDITOR_TEXT.createFieldTypeHint}
                            </p>
                        </div>

                        <label className="flex items-center gap-2 self-end text-sm">
                            <Checkbox
                                checked={form.draft.isRequired}
                                disabled={isLocked}
                                onCheckedChange={checked =>
                                    form.setRequired(checked === true)
                                }
                            />
                            {QUESTIONNAIRE_EDITOR_TEXT.createFieldRequired}
                        </label>
                    </div>

                    {form.withOptions && (
                        <QuestionnaireFieldCreateOptions
                            options={form.draft.options}
                            disabled={isLocked}
                            onChangeTitle={form.setOptionTitle}
                            onAdd={form.addOption}
                            onRemove={form.removeOption}
                        />
                    )}

                    {/* Замечание к черновику — то же самое, чем ответил бы
                        бэк: владелец читает его до нажатия. */}
                    {form.problem && (
                        <p className="text-xs text-destructive">
                            {form.problem}
                        </p>
                    )}

                    {/* Поле в носителе уже было и анкете не годится:
                        панель остаётся открытой с набранным черновиком —
                        владельцу менять код, а не собирать форму заново. */}
                    {form.rejectReason && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle className="text-sm font-medium">
                                {QUESTIONNAIRE_EDITOR_TEXT.createFieldRejected}
                            </AlertTitle>
                            <AlertDescription className="text-xs">
                                {form.rejectReason}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                            {QUESTIONNAIRE_EDITOR_TEXT.createFieldSlowHint}
                        </span>
                        <Button
                            // Второе нажатие дубля не заведёт, но заставит
                            // ждать вдвое дольше — запираем на всё время.
                            disabled={isLocked || !!form.problem}
                            onClick={form.submit}
                        >
                            {isLocked && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {isLocked
                                ? QUESTIONNAIRE_EDITOR_TEXT.createFieldPending
                                : QUESTIONNAIRE_EDITOR_TEXT.createFieldSubmit}
                        </Button>
                    </div>
                </>
            )}
        </section>
    );
};
