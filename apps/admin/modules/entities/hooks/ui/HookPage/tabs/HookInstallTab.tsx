'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { ToneBadge } from '@workspace/april-ui/badges';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { MarkdownView } from '@/modules/shared/ui/markdown';
import { HOOKS_TEXT } from '../../../consts/hooks.const';
import { buildHookHref } from '../../../lib/hooks-view';
import type { HookCatalogEntry } from '../../../model';
import { HookNotice } from '../../components/HookNotice';

interface HookInstallTabProps {
    entry: HookCatalogEntry;
    portalId: number | undefined;
    fixed: boolean;
}

/**
 * Что установить и как проверить, ловушки, статьи базы знаний (с пометкой
 * заготовок «готовится») и связанные хуки.
 */
export const HookInstallTab = ({ entry, portalId, fixed }: HookInstallTabProps) => (
    <div className="space-y-4">
        <SectionCard title={HOOKS_TEXT.installTitle}>
            {entry.install ? (
                <MarkdownView text={entry.install} />
            ) : (
                <p className="text-sm text-muted-foreground">{HOOKS_TEXT.installEmpty}</p>
            )}
        </SectionCard>

        <SectionCard title={HOOKS_TEXT.verifyTitle}>
            {entry.verify ? (
                <MarkdownView text={entry.verify} />
            ) : (
                <p className="text-sm text-muted-foreground">{HOOKS_TEXT.verifyEmpty}</p>
            )}
        </SectionCard>

        {entry.warnings.length > 0 && (
            <HookNotice
                tone="warning"
                title={HOOKS_TEXT.warningsTitle}
                message={
                    <ul className="list-disc space-y-1 pl-5">
                        {entry.warnings.map(warning => (
                            <li key={warning}>{warning}</li>
                        ))}
                    </ul>
                }
            />
        )}

        <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard
                title={HOOKS_TEXT.kbDocsTitle}
                description={HOOKS_TEXT.kbDocsHint}
            >
                {entry.kbDocs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{HOOKS_TEXT.kbDocsEmpty}</p>
                ) : (
                    <ul className="space-y-2">
                        {entry.kbDocs.map(doc => (
                            <li key={doc.key} className="flex flex-wrap items-center gap-2 text-sm">
                                <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary underline underline-offset-2"
                                >
                                    {doc.title}
                                    <ExternalLink className="size-3" />
                                </a>
                                {doc.ready === false && (
                                    <ToneBadge
                                        tone="warning"
                                        variant="soft"
                                        size="sm"
                                        title={HOOKS_TEXT.kbDocStubHint}
                                    >
                                        {HOOKS_TEXT.kbDocStub}
                                    </ToneBadge>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </SectionCard>

            <SectionCard title={HOOKS_TEXT.relatedTitle}>
                {entry.related.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{HOOKS_TEXT.relatedEmpty}</p>
                ) : (
                    <ul className="space-y-2">
                        {entry.related.map(item => (
                            <li key={item.code} className="text-sm">
                                <Link
                                    href={buildHookHref(item.code, portalId, fixed)}
                                    className="text-primary underline underline-offset-2"
                                >
                                    {item.title}
                                </Link>{' '}
                                <code className="font-mono text-[11px] text-muted-foreground">
                                    {item.code}
                                </code>
                            </li>
                        ))}
                    </ul>
                )}
            </SectionCard>
        </div>
    </div>
);
