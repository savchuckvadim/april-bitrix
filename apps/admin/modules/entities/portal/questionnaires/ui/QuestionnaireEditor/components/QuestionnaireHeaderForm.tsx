'use client';

import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { PORTAL_APP_TITLE } from '@/modules/entities/portal/app-settings';
import type { PortalAppCode } from '@/modules/entities/portal/app-settings';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type {
    PortalQuestionnaireListItem,
    PortalQuestionnaireSchema,
    QuestionnaireAppCode,
    QuestionnairePurpose,
} from '../../../model';
import {
    QUESTIONNAIRE_CODE,
    pickQuestionnaireCode,
    questionnaireCodeOptions,
} from '../../../model';
import type { QuestionnaireDraft } from '../../../lib/questionnaire-draft';
import { QuestionnaireCompatibilityBlock } from './QuestionnaireCompatibilityBlock';
import { QuestionnairePurposeCards } from './QuestionnairePurposeCards';

interface QuestionnaireHeaderFormProps {
    draft: QuestionnaireDraft;
    schema: PortalQuestionnaireSchema | undefined;
    /** Анкета ещё не создана: приложение и код задаются только здесь. */
    isNew: boolean;
    appCodes: QuestionnaireAppCode[];
    /** Анкета, которую перезапишет сохранение под этим кодом. */
    codeConflict: PortalQuestionnaireListItem | null;
    /**
     * Список анкет не прочитан — занятость кода проверить нечем, сохранение
     * заперто. `null` — проверка состоялась.
     */
    codeCheckError: string | null;
    onPatch: (patch: Partial<QuestionnaireDraft>) => void;
    onTitleChange: (title: string) => void;
    onPurposeChange: (purpose: QuestionnairePurpose) => void;
}

const appTitle = (code: QuestionnaireAppCode): string =>
    PORTAL_APP_TITLE[code as PortalAppCode] ?? code;

/**
 * Шапка анкеты: что это за анкета, кому и где она показывается.
 *
 * Код здесь не редактируется никогда: он собирается транслитом названия при
 * создании и дальше остаётся ключом, по которому фрейм узнаёт уже собранные
 * ответы. Единственная защита, которая тут нужна, — предупредить о занятом
 * коде: сохранение на бэке делает upsert и заменило бы чужую анкету молча.
 */
export const QuestionnaireHeaderForm = ({
    draft,
    schema,
    isNew,
    appCodes,
    codeConflict,
    codeCheckError,
    onPatch,
    onTitleChange,
    onPurposeChange,
}: QuestionnaireHeaderFormProps) => {
    const presentation =
        draft.presentation ?? QUESTIONNAIRE_CODE.presentation.inline;
    const isInline = presentation === QUESTIONNAIRE_CODE.presentation.inline;

    // Подписи и порядок — из реестра, коды сужены до контракта: предлагать
    // значение, которого тело сохранения не примет, значит обещать 400.
    const purposes = questionnaireCodeOptions(
        QUESTIONNAIRE_CODE.purpose,
        schema?.purposes,
    );
    const presentations = questionnaireCodeOptions(
        QUESTIONNAIRE_CODE.presentation,
        schema?.presentations,
    );
    const places = questionnaireCodeOptions(
        QUESTIONNAIRE_CODE.place,
        schema?.places,
    );
    const persists = questionnaireCodeOptions(
        QUESTIONNAIRE_CODE.persist,
        schema?.persists,
    );

    return (
        <section className="space-y-4 rounded-lg border p-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                    <Label htmlFor="questionnaire-title">
                        {QUESTIONNAIRE_EDITOR_TEXT.titleLabel}
                    </Label>
                    <Input
                        id="questionnaire-title"
                        value={draft.title}
                        placeholder={QUESTIONNAIRE_EDITOR_TEXT.titlePlaceholder}
                        onChange={event => onTitleChange(event.target.value)}
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="questionnaire-code">
                        {QUESTIONNAIRE_EDITOR_TEXT.codeLabel}
                    </Label>
                    <Input
                        id="questionnaire-code"
                        readOnly
                        className="font-mono"
                        value={draft.code}
                        placeholder={QUESTIONNAIRE_EDITOR_TEXT.codeEmpty}
                    />
                    <p className="text-xs text-muted-foreground">
                        {QUESTIONNAIRE_EDITOR_TEXT.codeHint}
                    </p>
                    {codeConflict && (
                        <p className="text-xs text-destructive">
                            {QUESTIONNAIRE_EDITOR_TEXT.codeConflict} (
                            {codeConflict.title})
                        </p>
                    )}
                    {codeCheckError && (
                        <p className="text-xs text-destructive">
                            {codeCheckError}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-1">
                <Label htmlFor="questionnaire-hint">
                    {QUESTIONNAIRE_EDITOR_TEXT.hintLabel}
                </Label>
                <Textarea
                    id="questionnaire-hint"
                    rows={2}
                    value={draft.hint ?? ''}
                    placeholder={QUESTIONNAIRE_EDITOR_TEXT.hintPlaceholder}
                    onChange={event =>
                        onPatch({ hint: event.target.value || null })
                    }
                />
            </div>

            <div className="space-y-2">
                <Label>{QUESTIONNAIRE_EDITOR_TEXT.purposeLabel}</Label>
                <QuestionnairePurposeCards
                    purposes={purposes}
                    value={draft.purpose}
                    onChange={onPurposeChange}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                    <Label>{QUESTIONNAIRE_EDITOR_TEXT.presentationLabel}</Label>
                    <Select
                        value={presentation}
                        onValueChange={value => {
                            const next = pickQuestionnaireCode(
                                QUESTIONNAIRE_CODE.presentation,
                                value,
                            );
                            if (!next) return;
                            onPatch({
                                presentation: next,
                                // Колонка есть только у карточки — модалке
                                // бэк задать её не даст.
                                place:
                                    next ===
                                    QUESTIONNAIRE_CODE.presentation.inline
                                        ? draft.place
                                        : null,
                            });
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {presentations.map(option => (
                                <SelectItem
                                    key={option.code}
                                    value={option.code}
                                >
                                    {option.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label>{QUESTIONNAIRE_EDITOR_TEXT.placeLabel}</Label>
                    <Select
                        value={draft.place ?? ''}
                        disabled={!isInline}
                        onValueChange={value => {
                            const next = pickQuestionnaireCode(
                                QUESTIONNAIRE_CODE.place,
                                value,
                            );
                            if (next) onPatch({ place: next });
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue
                                placeholder={
                                    QUESTIONNAIRE_EDITOR_TEXT.placeLabel
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {places.map(option => (
                                <SelectItem
                                    key={option.code}
                                    value={option.code}
                                >
                                    {option.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {!isInline && (
                        <p className="text-xs text-muted-foreground">
                            {QUESTIONNAIRE_EDITOR_TEXT.placeModal}
                        </p>
                    )}
                </div>

                <div className="space-y-1">
                    <Label>{QUESTIONNAIRE_EDITOR_TEXT.persistLabel}</Label>
                    <Select
                        value={draft.persist ?? persists[0]?.code ?? ''}
                        disabled={persists.length < 2}
                        onValueChange={value => {
                            const next = pickQuestionnaireCode(
                                QUESTIONNAIRE_CODE.persist,
                                value,
                            );
                            if (next) onPatch({ persist: next });
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {persists.map(option => (
                                <SelectItem
                                    key={option.code}
                                    value={option.code}
                                >
                                    {option.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {/* Реестр отдаёт один момент записи: поле показываем
                        запертым, чтобы смысл был виден, а выбор — честен. */}
                    {persists.length < 2 && (
                        <p className="text-xs text-muted-foreground">
                            {QUESTIONNAIRE_EDITOR_TEXT.persistSingle}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                    <Label>{QUESTIONNAIRE_EDITOR_TEXT.appLabel}</Label>
                    {isNew ? (
                        <Select
                            value={draft.appCode}
                            // Выбрать можно только приложение ЭТОГО портала:
                            // код берётся из самого списка, а не из строки
                            // селекта — так он и типизирован, и проверен.
                            onValueChange={value => {
                                const next = appCodes.find(
                                    code => code === value,
                                );
                                if (next) onPatch({ appCode: next });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {appCodes.map(code => (
                                    <SelectItem key={code} value={code}>
                                        {appTitle(code)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input readOnly value={appTitle(draft.appCode)} />
                    )}
                    <p className="text-xs text-muted-foreground">
                        {QUESTIONNAIRE_EDITOR_TEXT.appHint}
                    </p>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="questionnaire-sort">
                        {QUESTIONNAIRE_EDITOR_TEXT.sortLabel}
                    </Label>
                    <Input
                        id="questionnaire-sort"
                        inputMode="numeric"
                        value={String(draft.sort ?? '')}
                        onChange={event =>
                            onPatch({ sort: Number(event.target.value) || 0 })
                        }
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="questionnaire-active">
                        {QUESTIONNAIRE_EDITOR_TEXT.activeLabel}
                    </Label>
                    <div className="flex h-9 items-center">
                        <Switch
                            id="questionnaire-active"
                            checked={draft.isActive ?? false}
                            onCheckedChange={checked =>
                                onPatch({ isActive: checked })
                            }
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {QUESTIONNAIRE_EDITOR_TEXT.activeHint}
                    </p>
                </div>
            </div>

            <QuestionnaireCompatibilityBlock
                configKey={draft.configKey ?? null}
                legacyChecklistId={draft.legacyChecklistId ?? null}
                onChange={onPatch}
            />
        </section>
    );
};
