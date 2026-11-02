'use client';

import { ChoiceChips } from '@workspace/april-ui/fields';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import {
    METHODOLOGIES_TEXT,
    SCOPE_LABELS,
    type MethodologyCatalog,
    type MethodologyScope,
} from '../../../model';
import type { MethodologyForm } from '../../../lib/hooks/use-methodology-form';
import {
    bumpVersion,
    isValidMethodologyCode,
    suggestCode,
} from '../../../lib/methodology-form.util';
import { TypeChips } from './TypeChips';

interface EditorHeaderProps {
    form: MethodologyForm;
    domain: string | undefined;
    catalog: MethodologyCatalog | undefined;
}

/** Шапка брифа: код, название, версия, слой, включена, типы звонков. */
export const EditorHeader = ({ form, domain, catalog }: EditorHeaderProps) => {
    const texts = METHODOLOGIES_TEXT.editor;
    const { state } = form;
    const isNew = state.source === 'new';
    const scopeOptions = [
        { value: 'common', label: SCOPE_LABELS.common },
        ...(state.portalDomain
            ? [{ value: 'portal', label: `${SCOPE_LABELS.portal}: ${state.portalDomain}` }]
            : []),
    ];

    const changeTitle = (title: string) => {
        const patch: { title: string; code?: string } = { title };
        if (isNew && (state.config.code === '' || state.config.code === suggestCode(state.config.title))) {
            patch.code = suggestCode(title);
        }
        form.patchConfig(patch);
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_14rem_12rem]">
                <div className="space-y-1">
                    <Label htmlFor="methodology-title">{texts.name}</Label>
                    <Input
                        id="methodology-title"
                        value={state.config.title}
                        onChange={event => changeTitle(event.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="methodology-code">{texts.code}</Label>
                    <Input
                        id="methodology-code"
                        value={state.config.code}
                        aria-invalid={!isValidMethodologyCode(state.config.code)}
                        disabled={!isNew}
                        onChange={event =>
                            form.patchConfig({ code: event.target.value.trim().toLowerCase() })
                        }
                    />
                    <p className="text-xs text-muted-foreground">{texts.codeHint}</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="methodology-version">{texts.version}</Label>
                    <div className="flex gap-1">
                        <Input
                            id="methodology-version"
                            value={state.config.version}
                            onChange={event => form.patchConfig({ version: event.target.value.trim() })}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            onClick={() => form.patchConfig({ version: bumpVersion(state.config.version) })}
                        >
                            {texts.bumpVersion}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{texts.versionHint}</p>
                </div>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="space-y-1">
                    <Label>{texts.scope}</Label>
                    <ChoiceChips
                        ariaLabel={texts.scope}
                        options={scopeOptions}
                        value={state.scope}
                        collapseBelow="sm"
                        onChange={value =>
                            form.patchMeta({
                                scope: value as MethodologyScope,
                                portalDomain: value === 'portal' ? (state.portalDomain ?? domain ?? null) : state.portalDomain,
                            })
                        }
                    />
                    <p className="text-xs text-muted-foreground">
                        {state.scope === 'portal' && !state.portalDomain
                            ? texts.noDomainForPortal
                            : texts.scopeHint}
                    </p>
                </div>
                <label className="flex items-center gap-2 self-start pt-6 text-sm">
                    <Switch
                        checked={state.isActive}
                        onCheckedChange={isActive => form.patchMeta({ isActive })}
                    />
                    <span>
                        {texts.active}
                        <span className="block text-xs text-muted-foreground">{texts.activeHint}</span>
                    </span>
                </label>
            </div>
            <TypeChips
                label={texts.types}
                options={catalog?.callTypes ?? []}
                value={state.config.types}
                onChange={types => form.patchConfig({ types })}
                size="default"
            />
        </div>
    );
};
