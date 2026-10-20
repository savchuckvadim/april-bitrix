'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ToneBadge } from '@workspace/april-ui/badges';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { GUIDE_TEXT } from '../../../consts/ai-analytics-guide.const';
import { buildGuideSectionHref, resolveGuideHref } from '../../../lib/guide-view';
import type { GuideSection } from '../../../model';
import { GuideParams } from './GuideParams';

interface GuideRelationsProps {
    section: GuideSection;
    portalId: number | undefined;
    onSelectSection: (code: string) => void;
}

const LINK_CLASS = 'text-primary underline underline-offset-2 hover:opacity-80';

/** Ссылка с подстановкой портала; без портала — подпись «нужен портал». */
const PortalLink = ({
    href,
    portalId,
    children,
}: {
    href: string;
    portalId: number | undefined;
    children: ReactNode;
}) => {
    const resolved = resolveGuideHref(href, portalId);
    if (!resolved) {
        return (
            <span className="text-muted-foreground" title={GUIDE_TEXT.portalHint}>
                {children}{' '}
                <span className="text-[11px]">({GUIDE_TEXT.noPortalForLink})</span>
            </span>
        );
    }
    return (
        <Link href={resolved} className={LINK_CLASS}>
            {children}
        </Link>
    );
};

/**
 * Блок «Связано»: настройки kpiSales с переходом в карточку портала и
 * якорем на ключ, поля настроек AI портала, параметры реестра по группам,
 * kind'ы базы знаний с переходом в базу знаний портала, страницы админки и
 * смежные разделы. Названия и описания — с бэка (схема, реестр, kind'ы).
 */
export const GuideRelations = ({ section, portalId, onSelectSection }: GuideRelationsProps) => (
    <div className="space-y-4">
        <SectionCard title={GUIDE_TEXT.settingsTitle} density="compact">
            {section.settings.length === 0 ? (
                <p className="text-sm text-muted-foreground">{GUIDE_TEXT.settingsEmpty}</p>
            ) : (
                <ul className="space-y-2 text-sm">
                    {section.settings.map(item => (
                        <li key={item.code} className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <PortalLink href={item.href} portalId={portalId}>
                                    {item.name}
                                </PortalLink>
                                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                                    {item.code}
                                </code>
                                <ToneBadge tone="muted" variant="soft" size="sm">
                                    {item.groupTitle}
                                </ToneBadge>
                                <span className="text-[11px] text-muted-foreground">
                                    {item.type}, {GUIDE_TEXT.defaultValue.toLowerCase()}:{' '}
                                    {String(item.default)}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.note}</p>
                        </li>
                    ))}
                </ul>
            )}
        </SectionCard>

        <SectionCard title={GUIDE_TEXT.portalAiSettingsTitle} density="compact">
            {section.portalAiSettings.length === 0 ? (
                <p className="text-sm text-muted-foreground">{GUIDE_TEXT.portalAiSettingsEmpty}</p>
            ) : (
                <ul className="space-y-2 text-sm">
                    {section.portalAiSettings.map(item => (
                        <li key={item.field} className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <PortalLink href={item.href} portalId={portalId}>
                                    {item.title}
                                </PortalLink>
                                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                                    {item.field}
                                </code>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.note}</p>
                        </li>
                    ))}
                </ul>
            )}
        </SectionCard>

        <GuideParams params={section.params} portalId={portalId} />

        <SectionCard title={GUIDE_TEXT.kindsTitle} density="compact">
            {section.knowledgeKinds.length === 0 ? (
                <p className="text-sm text-muted-foreground">{GUIDE_TEXT.kindsEmpty}</p>
            ) : (
                <ul className="space-y-2 text-sm">
                    {section.knowledgeKinds.map(item => (
                        <li key={item.kind} className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">{item.title}</span>
                                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                                    {item.kind}
                                </code>
                                <ToneBadge
                                    tone={item.clientEditable ? 'success' : 'warning'}
                                    variant="soft"
                                    size="sm"
                                >
                                    {item.clientEditable ? GUIDE_TEXT.clientEditable : GUIDE_TEXT.aprilOnly}
                                </ToneBadge>
                                <PortalLink href={item.href} portalId={portalId}>
                                    {GUIDE_TEXT.openKind}
                                </PortalLink>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {item.description} {GUIDE_TEXT.consumer}: {item.consumer}.
                                {item.note ? ` ${item.note}` : ''}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </SectionCard>

        <SectionCard title={GUIDE_TEXT.pagesTitle} density="compact">
            <ul className="space-y-1.5 text-sm">
                {section.adminPages.map(page => (
                    <li key={page.href}>
                        <PortalLink href={page.href} portalId={portalId}>
                            {page.title}
                        </PortalLink>
                        {page.note && (
                            <span className="text-xs text-muted-foreground"> — {page.note}</span>
                        )}
                    </li>
                ))}
            </ul>
            {section.related.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{GUIDE_TEXT.relatedSectionsTitle}:</span>
                    {section.related.map(item => (
                        <a
                            key={item.code}
                            href={buildGuideSectionHref(item.code, portalId)}
                            onClick={event => {
                                event.preventDefault();
                                onSelectSection(item.code);
                            }}
                            className="rounded border px-2 py-0.5 hover:bg-accent hover:text-foreground"
                        >
                            {item.title}
                        </a>
                    ))}
                </div>
            )}
        </SectionCard>
    </div>
);
