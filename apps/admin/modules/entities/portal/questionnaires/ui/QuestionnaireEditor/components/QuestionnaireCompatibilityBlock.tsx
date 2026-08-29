'use client';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@workspace/ui/components/collapsible';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { ChevronDown } from 'lucide-react';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';

interface QuestionnaireCompatibilityBlockProps {
    configKey: string | null;
    legacyChecklistId: string | null;
    onChange: (patch: {
        configKey?: string | null;
        legacyChecklistId?: string | null;
    }) => void;
}

/** Пустая строка в поле означает «не задано», а не пустое значение. */
const toValue = (raw: string): string | null => (raw === '' ? null : raw);

/**
 * Совместимость со встроенными наборами фронта — свёрнутым блоком.
 *
 * Нужна редко и только при переносе старых чек-листов, поэтому не мозолит
 * глаза. Главное здесь — предупреждение: указанный набор анкета ЗАМЕЩАЕТ, а
 * не дополняет. Перепутать эти два смысла дорого: менеджер получил бы один
 * и тот же вопрос дважды, а половина ответов ушла бы в старое хранилище.
 */
export const QuestionnaireCompatibilityBlock = ({
    configKey,
    legacyChecklistId,
    onChange,
}: QuestionnaireCompatibilityBlockProps) => (
    <Collapsible className="rounded-lg border">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium">
            {QUESTIONNAIRE_EDITOR_TEXT.compatibility}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 border-t px-4 py-4">
            <p className="text-sm text-muted-foreground">
                {QUESTIONNAIRE_EDITOR_TEXT.compatibilityHint}
            </p>

            <div className="space-y-1">
                <Label htmlFor="questionnaire-config-key">
                    {QUESTIONNAIRE_EDITOR_TEXT.configKeyLabel}
                </Label>
                <Input
                    id="questionnaire-config-key"
                    value={configKey ?? ''}
                    onChange={event =>
                        onChange({ configKey: toValue(event.target.value) })
                    }
                />
                <p className="text-xs text-muted-foreground">
                    {QUESTIONNAIRE_EDITOR_TEXT.configKeyHint}
                </p>
            </div>

            <div className="space-y-1">
                <Label htmlFor="questionnaire-legacy-checklist">
                    {QUESTIONNAIRE_EDITOR_TEXT.legacyChecklistLabel}
                </Label>
                <Input
                    id="questionnaire-legacy-checklist"
                    value={legacyChecklistId ?? ''}
                    onChange={event =>
                        onChange({
                            legacyChecklistId: toValue(event.target.value),
                        })
                    }
                />
                <p className="text-xs text-muted-foreground">
                    {QUESTIONNAIRE_EDITOR_TEXT.legacyChecklistHint}
                </p>
            </div>
        </CollapsibleContent>
    </Collapsible>
);
