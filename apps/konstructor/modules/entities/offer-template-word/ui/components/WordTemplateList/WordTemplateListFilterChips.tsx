'use client';

import React from 'react';
import { WordTemplateVisibility } from '../../../types/word-template-types';
import type { WordTemplateListFiltersState } from '../../../lib/utils/word-template-list-filters-storage';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

export interface WordTemplateListFilterChipsProps {
    isSuperUser: boolean;
    visibilityCounts: { public: number; portal: number; user: number };
    activeCount: number;
    inactiveCount: number;
    favoritesCount: number;
    activeFilters: WordTemplateListFiltersState;
    hasActiveFilters: boolean;
    onToggleVisibility: (visibility: WordTemplateVisibility) => void;
    onToggleActive: () => void;
    onToggleFavorites: () => void;
    onClear: () => void;
}

export const WordTemplateListFilterChips: React.FC<WordTemplateListFilterChipsProps> = ({
    isSuperUser,
    visibilityCounts,
    activeCount: _activeCount,
    inactiveCount: _inactiveCount,
    favoritesCount,
    activeFilters,
    hasActiveFilters,
    onToggleVisibility,
    onToggleActive: _onToggleActive,
    onToggleFavorites,
    onClear,
}) => {
    const chipClass = (active: boolean) =>
        cn('h-8 rounded-full px-3 text-xs', active ? '' : 'border-dashed');

    return (
        <div className="word-template-list__filters">
            <div className="flex flex-wrap items-center gap-2">
                {isSuperUser && visibilityCounts.public > 0 && (
                    <Button
                        type="button"
                        variant={activeFilters.visibility === WordTemplateVisibility.PUBLIC ? 'default' : 'outline'}
                        size="sm"
                        className={chipClass(activeFilters.visibility === WordTemplateVisibility.PUBLIC)}
                        onClick={() => onToggleVisibility(WordTemplateVisibility.PUBLIC)}
                    >
                        Публичные ({visibilityCounts.public})
                    </Button>
                )}
                {visibilityCounts.portal > 0 && (
                    <Button
                        type="button"
                        variant={activeFilters.visibility === WordTemplateVisibility.PORTAL ? 'default' : 'outline'}
                        size="sm"
                        className={chipClass(activeFilters.visibility === WordTemplateVisibility.PORTAL)}
                        onClick={() => onToggleVisibility(WordTemplateVisibility.PORTAL)}
                    >
                        Портал ({visibilityCounts.portal})
                    </Button>
                )}
                {visibilityCounts.user > 0 && (
                    <Button
                        type="button"
                        variant={activeFilters.visibility === WordTemplateVisibility.USER ? 'default' : 'outline'}
                        size="sm"
                        className={chipClass(activeFilters.visibility === WordTemplateVisibility.USER)}
                        onClick={() => onToggleVisibility(WordTemplateVisibility.USER)}
                    >
                        Мои ({visibilityCounts.user})
                    </Button>
                )}
                {favoritesCount > 0 && (
                    <Button
                        type="button"
                        variant={activeFilters.showFavorites ? 'secondary' : 'outline'}
                        size="sm"
                        className={chipClass(!!activeFilters.showFavorites)}
                        onClick={onToggleFavorites}
                    >
                        Избранные ({favoritesCount})
                    </Button>
                )}
                {hasActiveFilters && (
                    <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={onClear}>
                        Очистить
                    </Button>
                )}
            </div>
        </div>
    );
};
