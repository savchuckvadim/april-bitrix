'use client';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { LEGACY_CREDENTIALS_TEXT } from '../../../consts/legacy-credentials.const';
import type { LegacyCredentialsForm } from '../../../lib/hooks/use-legacy-credentials-form';
import { HookKeyHints } from './HookKeyHints';

interface HookKeyFormProps {
    form: LegacyCredentialsForm;
}

const INPUT_ID = 'legacy-credentials-hook';

/** Ввод нового вебхука и запись его в online. */
export const HookKeyForm = ({ form }: HookKeyFormProps) => (
    <div className="space-y-2">
        <Label htmlFor={INPUT_ID}>{LEGACY_CREDENTIALS_TEXT.inputLabel}</Label>
        <div className="flex flex-wrap items-center gap-2">
            <Input
                id={INPUT_ID}
                value={form.draft}
                placeholder={LEGACY_CREDENTIALS_TEXT.inputPlaceholder}
                onChange={e => form.setDraft(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                className="max-w-xl font-mono text-xs"
            />
            <Button size="sm" onClick={form.submit} disabled={!form.canSave}>
                {form.isSaving
                    ? LEGACY_CREDENTIALS_TEXT.saving
                    : LEGACY_CREDENTIALS_TEXT.save}
            </Button>
        </div>
        <HookKeyHints
            draft={form.draft}
            nextKey={form.nextKey}
            error={form.error}
            secretsCarryOver={form.secretsCarryOver}
        />
    </div>
);
