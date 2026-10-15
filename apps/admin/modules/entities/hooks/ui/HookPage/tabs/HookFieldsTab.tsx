'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ToneBadge } from '@workspace/april-ui/badges';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { DataTable, type Column } from '@/modules/shared/ui/data-table';
import {
    HOOK_ENTITY_LABEL,
    HOOK_FIELD_ROLE_LABEL,
    HOOKS_TEXT,
} from '../../../consts/hooks.const';
import {
    mergeHookFields,
    mergeHookStages,
    resolveHookLink,
    sortHookFieldRows,
    type HookFieldRow,
    type HookStageRow,
} from '../../../lib/hooks-view';
import type { HookCatalogEntry, PortalHookReadiness } from '../../../model';

interface HookFieldsTabProps {
    entry: HookCatalogEntry;
    portalId: number | undefined;
    readiness: PortalHookReadiness | undefined;
}

/** Есть/нет на портале; обязательное отсутствующее — красным, необязательное — серым. */
const PresenceBadge = ({
    present,
    required,
    yes,
    no,
}: {
    present: boolean | null;
    required: boolean;
    yes: string;
    no: string;
}) => {
    if (present === null) return <span className="text-muted-foreground">—</span>;
    return present ? (
        <ToneBadge tone="success" variant="soft" size="sm">
            {yes}
        </ToneBadge>
    ) : (
        <ToneBadge tone={required ? 'destructive' : 'muted'} variant="soft" size="sm">
            {no}
        </ToneBadge>
    );
};

const SectionLink = ({ href, portalId }: { href: string | null; portalId?: number }) =>
    href && portalId ? (
        <Link
            href={resolveHookLink(href, portalId)}
            className="text-xs text-primary underline underline-offset-2"
        >
            {HOOKS_TEXT.openPbxSection}
        </Link>
    ) : null;

const fieldColumns = (portalId: number | undefined): Column<HookFieldRow>[] => [
    {
        id: 'entity',
        header: HOOKS_TEXT.fieldEntity,
        cell: row => HOOK_ENTITY_LABEL[row.entity],
        className: 'w-24',
    },
    {
        id: 'name',
        header: HOOKS_TEXT.fieldName,
        cell: row => (
            <div className="space-y-0.5 whitespace-normal">
                <div className="font-medium">
                    {row.name}
                    {row.required && <span className="text-destructive"> *</span>}
                </div>
                {row.note && (
                    <div className="text-xs text-muted-foreground">{row.note}</div>
                )}
            </div>
        ),
    },
    {
        id: 'code',
        header: HOOKS_TEXT.fieldCode,
        cell: row => (
            <code className="font-mono text-xs" title={row.type}>
                {row.code}
            </code>
        ),
        className: 'w-56',
    },
    {
        id: 'type',
        header: HOOKS_TEXT.fieldType,
        cell: row => row.type || '—',
        className: 'w-28',
    },
    {
        id: 'role',
        header: HOOKS_TEXT.fieldRole,
        cell: row => HOOK_FIELD_ROLE_LABEL[row.role],
        className: 'w-32',
    },
    {
        id: 'installed',
        header: HOOKS_TEXT.fieldInstalled,
        cell: row => (
            <div className="space-y-1">
                <PresenceBadge
                    present={row.installed}
                    required={row.required}
                    yes={HOOKS_TEXT.installed}
                    no={HOOKS_TEXT.notInstalled}
                />
                {row.installed === false && (
                    <SectionLink href={row.href} portalId={portalId} />
                )}
            </div>
        ),
        className: 'w-36',
    },
];

const stageColumns = (portalId: number | undefined): Column<HookStageRow>[] => [
    {
        id: 'entity',
        header: HOOKS_TEXT.fieldEntity,
        cell: row => HOOK_ENTITY_LABEL[row.entity],
        className: 'w-24',
    },
    {
        id: 'title',
        header: HOOKS_TEXT.stageTitle,
        cell: row => (
            <div className="space-y-0.5 whitespace-normal">
                <div className="font-medium">
                    {row.title}
                    {row.required && <span className="text-destructive"> *</span>}
                </div>
                {row.note && (
                    <div className="text-xs text-muted-foreground">{row.note}</div>
                )}
            </div>
        ),
    },
    {
        id: 'code',
        header: HOOKS_TEXT.fieldCode,
        cell: row => <code className="font-mono text-xs">{row.code}</code>,
        className: 'w-48',
    },
    {
        id: 'mapped',
        header: HOOKS_TEXT.stageMapped,
        cell: row => (
            <div className="space-y-1">
                <PresenceBadge
                    present={row.mapped}
                    required={row.required}
                    yes={HOOKS_TEXT.mapped}
                    no={HOOKS_TEXT.notMapped}
                />
                {row.mapped === false && (
                    <SectionLink href={row.href} portalId={portalId} />
                )}
            </div>
        ),
        className: 'w-36',
    },
];

/**
 * PBX-поля и стадии, которые задействует хук: по сущностям, обязательные
 * помечены звёздочкой. С выбранным порталом — установлено ли и ссылка в
 * раздел PBX портала, где поле ставится или стадия сопоставляется.
 */
export const HookFieldsTab = ({ entry, portalId, readiness }: HookFieldsTabProps) => {
    const fields = useMemo(
        () => sortHookFieldRows(mergeHookFields(entry.pbxFields, readiness?.fields)),
        [entry.pbxFields, readiness?.fields],
    );
    const stages = useMemo(
        () => mergeHookStages(entry.stages, readiness?.stages),
        [entry.stages, readiness?.stages],
    );

    return (
        <div className="space-y-4">
            {!portalId && (
                <p className="text-xs text-muted-foreground">
                    {HOOKS_TEXT.selectPortalHint}
                </p>
            )}
            <SectionCard
                title={HOOKS_TEXT.fieldsTitle}
                description={HOOKS_TEXT.requiredLegend}
            >
                {fields.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {HOOKS_TEXT.fieldsEmpty}
                    </p>
                ) : (
                    <DataTable data={fields} columns={fieldColumns(portalId)} />
                )}
            </SectionCard>
            <SectionCard title={HOOKS_TEXT.stagesTitle}>
                {stages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {HOOKS_TEXT.stagesEmpty}
                    </p>
                ) : (
                    <DataTable data={stages} columns={stageColumns(portalId)} />
                )}
            </SectionCard>
        </div>
    );
};
