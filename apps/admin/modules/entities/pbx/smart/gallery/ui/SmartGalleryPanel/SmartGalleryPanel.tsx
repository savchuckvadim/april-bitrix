'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usePortal } from '@/modules/entities/portal/hooks';
import { Button } from '@workspace/ui/components/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { getApiErrorMessage } from '../../../../lib/api-error';
import type { TypedGroup } from '../../../../lib/model/common';
import { useReinstallSmart } from '../../../db/lib/hooks';
import { SmartDetailsPanel } from '../../../db/ui/SmartDetailsPanel';
import { useSmartGallery } from '../../lib/hooks';
import type { SmartGalleryCard } from '../../model';
import { ConstInstallDialog } from './components/ConstInstallDialog';
import {
    GALLERY_FILTER_ALL,
    GalleryFilterBar,
} from './components/GalleryFilterBar';
import { SmartCard } from './components/SmartCard';

const uniqueSorted = (values: string[]): string[] =>
    Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'ru'));

/**
 * Единая галерея смартов портала: merge строк `smarts` (PortalDB), реестра
 * const-смартов и эталонных Excel-смартов в карточки с клиентскими фильтрами.
 * Установленные выделены; неустановленные ставятся прямо из карточки —
 * const-смарты через `install-const`, эталонные — полной установкой по
 * эталону в выбранную «группу шаблонных».
 */
export function SmartGalleryPanel({ portalId }: { portalId: number }) {
    const router = useRouter();
    const pathname = usePathname();
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;

    const [templateGroup, setTemplateGroup] =
        React.useState<TypedGroup>('service');
    const [source, setSource] = React.useState<string>(GALLERY_FILTER_ALL);
    const [group, setGroup] = React.useState<string>(GALLERY_FILTER_ALL);
    const [type, setType] = React.useState<string>(GALLERY_FILTER_ALL);
    const [status, setStatus] = React.useState<string>(GALLERY_FILTER_ALL);
    const [search, setSearch] = React.useState('');
    const [constCard, setConstCard] = React.useState<SmartGalleryCard | null>(
        null,
    );
    const [detailsCard, setDetailsCard] =
        React.useState<SmartGalleryCard | null>(null);

    const { smarts, registry, cards } = useSmartGallery(
        portalId,
        domain,
        templateGroup,
    );
    const reinstall = useReinstallSmart(domain);

    const groupOptions = React.useMemo(
        () => uniqueSorted(cards.map((card) => card.group)),
        [cards],
    );
    const typeOptions = React.useMemo(
        () =>
            uniqueSorted(
                cards
                    .map((card) => card.type)
                    .filter((value): value is string => !!value),
            ),
        [cards],
    );

    const filtered = React.useMemo(() => {
        const query = search.trim().toLowerCase();
        return cards.filter((card) => {
            if (source !== GALLERY_FILTER_ALL && card.source !== source)
                return false;
            if (group !== GALLERY_FILTER_ALL && card.group !== group)
                return false;
            if (type !== GALLERY_FILTER_ALL && card.type !== type)
                return false;
            if (status === 'installed' && !card.installed) return false;
            if (status === 'not-installed' && card.installed) return false;
            if (!query) return true;
            return [
                card.name,
                card.title,
                card.type,
                card.group,
                card.entityTypeId !== undefined
                    ? String(card.entityTypeId)
                    : undefined,
            ].some((value) => value?.toLowerCase().includes(query));
        });
    }, [cards, source, group, type, status, search]);

    const isInstallBusy = (card: SmartGalleryCard) =>
        reinstall.isPending &&
        reinstall.variables?.name === card.template?.name &&
        reinstall.variables?.group === card.template?.group;

    return (
        <div className="space-y-4">
            <GalleryFilterBar
                source={source}
                group={group}
                type={type}
                status={status}
                search={search}
                templateGroup={templateGroup}
                groupOptions={groupOptions}
                typeOptions={typeOptions}
                onSourceChange={setSource}
                onGroupChange={setGroup}
                onTypeChange={setType}
                onStatusChange={setStatus}
                onSearchChange={setSearch}
                onTemplateGroupChange={setTemplateGroup}
            />

            {registry.isError && (
                <p className="text-xs text-muted-foreground">
                    Реестр const-смартов недоступен — в галерее показаны
                    только смарты портала и эталонные Excel-смарты.
                </p>
            )}

            {smarts.isPending ? (
                <p className="text-sm text-muted-foreground">
                    Загрузка смартов…
                </p>
            ) : smarts.isError ? (
                <div className="space-y-2">
                    <p className="text-sm text-destructive">
                        {getApiErrorMessage(
                            smarts.error,
                            'Не удалось загрузить смарты портала',
                        )}
                    </p>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void smarts.refetch()}
                    >
                        Повторить
                    </Button>
                </div>
            ) : (
                <>
                    <p className="text-xs text-muted-foreground">
                        Показано {filtered.length} из {cards.length}. Фильтры
                        и поиск работают на клиенте.
                    </p>
                    {filtered.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Под выбранные фильтры не попала ни одна карточка.
                        </p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {filtered.map((card) => (
                                <SmartCard
                                    key={card.key}
                                    card={card}
                                    installBusy={isInstallBusy(card)}
                                    installDisabled={!domain}
                                    onInstallConst={() => setConstCard(card)}
                                    onInstallExcel={() =>
                                        card.template &&
                                        reinstall.mutate(card.template)
                                    }
                                    onShowDetails={() => setDetailsCard(card)}
                                    // Страница сопоставления [group]/[variant]
                                    // (шаблон ↔ Bitrix ↔ БД, действия): excel —
                                    // по name, const — по type (name у него
                                    // русский title). Manual-смарты эталона не
                                    // имеют — их «Открыть» ведёт на страницу
                                    // реальных данных по smarts.id.
                                    onOpen={() =>
                                        router.push(
                                            card.template
                                                ? `${pathname}/${card.group}/${card.name}`
                                                : card.constKind
                                                  ? `${pathname}/${card.group}/${card.type}`
                                                  : `${pathname}/db/${card.dbSmart?.id}`,
                                        )
                                    }
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {constCard && (
                <ConstInstallDialog
                    open
                    onOpenChange={(open) => !open && setConstCard(null)}
                    kind={constCard.constKind ?? ''}
                    title={constCard.title}
                    portalDomain={domain}
                />
            )}

            <Dialog
                open={detailsCard !== null}
                onOpenChange={(open) => !open && setDetailsCard(null)}
            >
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            Детали смарта «{detailsCard?.title}»
                        </DialogTitle>
                        <DialogDescription>
                            Живое состояние в Bitrix и строка `smarts` из
                            PortalDB.
                        </DialogDescription>
                    </DialogHeader>
                    {detailsCard?.dbSmart && (
                        <SmartDetailsPanel smartId={detailsCard.dbSmart.id} />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
