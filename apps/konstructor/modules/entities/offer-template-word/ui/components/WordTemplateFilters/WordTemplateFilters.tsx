'use client';

import React from 'react';
import { WordTemplateVisibility } from '../../../types/word-template-types';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Button } from '@workspace/ui/components/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';

export interface WordTemplateFiltersState {
    visibility: WordTemplateVisibility | 'all' | '';
    isActive: 'all' | 'active' | 'inactive';
    search: string;
    showFavorites: boolean;
}

interface WordTemplateFiltersProps {
    filters: WordTemplateFiltersState;
    onFiltersChange: (filters: WordTemplateFiltersState) => void;
    isSuperUser: boolean;
}

export const WordTemplateFilters: React.FC<WordTemplateFiltersProps> = ({
    filters,
    onFiltersChange,
    isSuperUser,
}) => {
    const handleChange = (field: keyof WordTemplateFiltersState, value: string | boolean) => {
        onFiltersChange({ ...filters, [field]: value });
    };

    const hasActiveFilters =
        (filters.visibility !== 'all' && filters.visibility !== '') ||
        filters.isActive !== 'all' ||
        filters.search.trim() !== '' ||
        filters.showFavorites;

    const clearFilters = () => {
        onFiltersChange({
            visibility: 'all',
            isActive: 'all',
            search: '',
            showFavorites: false,
        });
    };

    return (
        <div className="word-template-filters space-y-4 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold">Фильтры</h4>
                {hasActiveFilters && (
                    <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                        Очистить
                    </Button>
                )}
            </div>

            <div className="word-template-filters__content space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="wt-filter-search">Поиск</Label>
                    <Input
                        id="wt-filter-search"
                        value={filters.search}
                        onChange={(e) => handleChange('search', e.target.value)}
                        placeholder="Название, код, теги..."
                    />
                </div>

                <div className="space-y-2">
                    <Label>Видимость</Label>
                    <Select
                        value={filters.visibility === '' ? 'all' : filters.visibility}
                        onValueChange={(v) => handleChange('visibility', v === 'all' ? 'all' : (v as WordTemplateVisibility))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Видимость" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все</SelectItem>
                            {isSuperUser && <SelectItem value={WordTemplateVisibility.PUBLIC}>Публичные</SelectItem>}
                            <SelectItem value={WordTemplateVisibility.PORTAL}>Наши</SelectItem>
                            <SelectItem value={WordTemplateVisibility.USER}>Мои</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Статус</Label>
                    <Select value={filters.isActive} onValueChange={(v) => handleChange('isActive', v)}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все</SelectItem>
                            <SelectItem value="active">Активные</SelectItem>
                            <SelectItem value="inactive">Неактивные</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Избранное</Label>
                    <Select
                        value={filters.showFavorites ? 'favorites' : 'all'}
                        onValueChange={(v) => handleChange('showFavorites', v === 'favorites')}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все шаблоны</SelectItem>
                            <SelectItem value="favorites">Только избранные</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};
