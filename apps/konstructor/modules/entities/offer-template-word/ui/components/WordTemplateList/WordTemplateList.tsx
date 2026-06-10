'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { WordTemplateSummary, WordTemplateVisibility } from '../../../types/word-template-types';
import { WordTemplateCard } from '../WordTemplateCard/WordTemplateCard';
import { searchTemplates, filterTemplatesByActive } from '../../../lib/utils/word-template-utils';
import {
    loadWordTemplateListFilters,
    persistWordTemplateListFilters,
    type WordTemplateListFiltersState,
} from '../../../lib/utils/word-template-list-filters-storage';
import { useWordTemplate } from '../../../hooks/useWordTemplate';
import { WordTemplateListFilterChips } from './WordTemplateListFilterChips';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Button } from '@workspace/ui/components/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

const PAGE_SIZE = 10;

interface WordTemplateListProps {
    templates: WordTemplateSummary[];
    favorites: string[];
    isSuperUser: boolean;
    search: string;
    onSearchChange: (search: string) => void;
    onSelect: (template: WordTemplateSummary) => void;
    onEdit: (template: WordTemplateSummary) => void;
    onDelete: (template: WordTemplateSummary) => void;
    onDownload: (template: WordTemplateSummary) => void;
    canEdit: (template: WordTemplateSummary) => boolean;
    canDelete: (template: WordTemplateSummary) => boolean;
}

export const WordTemplateList: React.FC<WordTemplateListProps> = ({
    templates,
    favorites,
    isSuperUser,
    search,
    onSearchChange,
    onSelect,
    onEdit,
    onDelete,
    onDownload,
    canEdit,
    canDelete,
}) => {
    const { selectedTemplate } = useWordTemplate();
    const [activeFilters, setActiveFilters] = useState<WordTemplateListFiltersState>(() =>
        loadWordTemplateListFilters(isSuperUser),
    );
    const [page, setPage] = useState(1);

    useEffect(() => {
        persistWordTemplateListFilters(activeFilters);
    }, [activeFilters]);

    useEffect(() => {
        if (!isSuperUser) {
            setActiveFilters((prev) => {
                if (prev.visibility === WordTemplateVisibility.PUBLIC) {
                    return { ...prev, visibility: undefined };
                }
                return prev;
            });
        }
    }, [isSuperUser]);

    const filteredTemplates = useMemo(() => {
        let result = [...templates];

        if (search.trim()) {
            result = searchTemplates(result, search);
        }

        if (activeFilters.visibility) {
            result = result.filter((t) => {
                const vis = String(t.visibility).toLowerCase();
                return vis === String(activeFilters.visibility).toLowerCase();
            });
        }

        if (activeFilters.isActive !== undefined) {
            result = filterTemplatesByActive(result, activeFilters.isActive);
        }

        if (activeFilters.showFavorites) {
            result = result.filter((t) => favorites.includes(t.id.toString()));
        }

        return result;
    }, [templates, search, activeFilters, favorites]);

    const listWithoutArchived = useMemo(
        () => filteredTemplates.filter((t) => t.is_archived !== true),
        [filteredTemplates],
    );

    const totalPages = useMemo(
        () => (listWithoutArchived.length === 0 ? 0 : Math.ceil(listWithoutArchived.length / PAGE_SIZE)),
        [listWithoutArchived],
    );

    const filtersKey = useMemo(() => JSON.stringify({ search: search.trim(), ...activeFilters }), [search, activeFilters]);

    useEffect(() => {
        setPage(1);
    }, [filtersKey]);

    useEffect(() => {
        if (totalPages === 0) {
            setPage(1);
            return;
        }
        setPage((p) => Math.min(p, totalPages));
    }, [totalPages]);

    const pageSlice = useMemo(() => {
        if (listWithoutArchived.length === 0 || totalPages === 0) {
            return [];
        }
        const safePage = Math.min(Math.max(1, page), totalPages);
        const start = (safePage - 1) * PAGE_SIZE;
        return listWithoutArchived.slice(start, start + PAGE_SIZE);
    }, [listWithoutArchived, page, totalPages]);

    const getVisibilityCounts = () => {
        const counts = {
            public: templates.filter((t) => String(t.visibility).toLowerCase() === WordTemplateVisibility.PUBLIC).length,
            portal: templates.filter(
                (t) =>
                    String(t.visibility).toLowerCase() === WordTemplateVisibility.PORTAL ||
                    String(t.visibility).toLowerCase() === 'private',
            ).length,
            user: templates.filter(
                (t) =>
                    String(t.visibility).toLowerCase() === WordTemplateVisibility.USER ||
                    String(t.visibility).toLowerCase() === 'user',
            ).length,
        };
        return counts;
    };

    const visibilityCounts = getVisibilityCounts();
    const activeCount = templates.filter((t) => t.is_active).length;
    const inactiveCount = templates.filter((t) => !t.is_active).length;
    const favoritesCount = favorites.length;

    const toggleVisibilityFilter = (visibility: WordTemplateVisibility) => {
        setActiveFilters((prev) => ({
            ...prev,
            visibility: prev.visibility === visibility ? undefined : visibility,
        }));
    };

    const toggleActiveFilter = () => {
        setActiveFilters((prev) => ({
            ...prev,
            isActive: prev.isActive === undefined ? true : prev.isActive === true ? false : undefined,
        }));
    };

    const toggleFavoritesFilter = () => {
        setActiveFilters((prev) => ({
            ...prev,
            showFavorites: !prev.showFavorites,
        }));
    };

    const clearFilters = () => {
        setActiveFilters({});
        onSearchChange('');
    };

    const hasActiveFilters =
        activeFilters.visibility !== undefined ||
        activeFilters.isActive !== undefined ||
        activeFilters.showFavorites ||
        search.trim() !== '';

    const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages);

    return (
        <div className="word-template-list flex flex-col gap-4">
            <div className="word-template-list__header flex flex-col gap-3">
                <div className="word-template-list__search space-y-2">
                    <Label htmlFor="word-template-search">Поиск</Label>
                    <Input
                        id="word-template-search"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Название, код, теги..."
                    />
                </div>

                <WordTemplateListFilterChips
                    isSuperUser={isSuperUser}
                    visibilityCounts={visibilityCounts}
                    activeCount={activeCount}
                    inactiveCount={inactiveCount}
                    favoritesCount={favoritesCount}
                    activeFilters={activeFilters}
                    hasActiveFilters={hasActiveFilters}
                    onToggleVisibility={toggleVisibilityFilter}
                    onToggleActive={toggleActiveFilter}
                    onToggleFavorites={toggleFavoritesFilter}
                    onClear={clearFilters}
                />
            </div>

            <div className="word-template-list__main min-h-0 flex-1">
                {listWithoutArchived.length === 0 ? (
                    <div className="word-template-list__empty rounded-lg border border-dashed border-border bg-muted/20 py-12 text-center">
                        <p className="text-sm text-muted-foreground">Шаблоны не найдены</p>
                    </div>
                ) : (
                    <>
                        <div className="word-template-list__grid-scroll max-h-[min(60vh,560px)] overflow-y-auto pr-1">
                            <div className="word-template-list__grid grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {pageSlice.map((template) => (
                                    <WordTemplateCard
                                        key={template.id}
                                        template={template}
                                        isSelected={selectedTemplate?.id === template.id}
                                        isFavorite={favorites.includes(template.id.toString())}
                                        canEdit={canEdit(template)}
                                        canDelete={canDelete(template)}
                                        onSelect={() => onSelect(template)}
                                        onEdit={() => onEdit(template)}
                                        onDelete={() => onDelete(template)}
                                        onDownload={() => onDownload(template)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="word-template-list__footer mt-4 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                            {totalPages > 1 && (
                                <div className="word-template-list__pagination flex items-center justify-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="size-8"
                                        disabled={safePage <= 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        aria-label="Предыдущая страница"
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Button>
                                    <span className="min-w-[120px] text-center text-sm text-muted-foreground">
                                        {safePage} / {totalPages}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="size-8"
                                        disabled={safePage >= totalPages}
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        aria-label="Следующая страница"
                                    >
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </div>
                            )}
                            <div
                                className={cn(
                                    'word-template-list__count text-center text-xs text-muted-foreground sm:text-left',
                                )}
                            >
                                Найдено: {listWithoutArchived.length} из {templates.length}
                                {totalPages > 1 && ` · Стр. ${safePage} из ${totalPages}`}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
