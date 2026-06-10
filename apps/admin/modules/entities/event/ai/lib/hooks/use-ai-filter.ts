'use client';

import * as React from 'react';
import { AiEntity } from '../../model';

/**
 * Состояние фильтров для AI записей
 */
export interface AiFilterState {
    search: string;
    selectedDomains: string[];
    selectedUsers: string[];
    selectedProviders: string[];
    selectedStatuses: string[];
    selectedEntityTypes: string[];
    selectedApps: string[];
    selectedDepartments: string[];
    selectedTypes: string[];
    selectedModels: string[];
    dateFrom?: string;
    dateTo?: string;
}

/**
 * Хук для управления фильтрацией AI записей
 * Инкапсулирует логику фильтрации данных по различным критериям
 */
export function useAiFilter(aiEntities: AiEntity[] | undefined) {
    const [filters, setFilters] = React.useState<AiFilterState>({
        search: '',
        selectedDomains: [],
        selectedUsers: [],
        selectedProviders: [],
        selectedStatuses: [],
        selectedEntityTypes: [],
        selectedApps: [],
        selectedDepartments: [],
        selectedTypes: [],
        selectedModels: [],
        dateFrom: undefined,
        dateTo: undefined,
    });

    // Получаем уникальные значения для опций фильтров
    const filterOptions = React.useMemo(() => {
        if (!aiEntities) {
            return {
                domains: [],
                users: [],
                providers: [],
                statuses: [],
                entityTypes: [],
                apps: [],
                departments: [],
                types: [],
                models: [],
            };
        }

        const domains = Array.from(new Set(aiEntities.map((a) => a.domain).filter(Boolean)));
        const users = Array.from(new Set(aiEntities.map((a) => a.user_id?.toString()).filter(Boolean)));
        const providers = Array.from(new Set(aiEntities.map((a) => a.provider).filter(Boolean)));
        const statuses = Array.from(new Set(aiEntities.map((a) => a.status).filter(Boolean)));
        const entityTypes = Array.from(new Set(aiEntities.map((a) => a.entity_type).filter(Boolean)));
        const apps = Array.from(new Set(aiEntities.map((a) => a.app).filter(Boolean)));
        const departments = Array.from(new Set(aiEntities.map((a) => a.department).filter(Boolean)));
        const types = Array.from(new Set(aiEntities.map((a) => a.type).filter(Boolean)));
        const models = Array.from(new Set(aiEntities.map((a) => a.model).filter(Boolean)));

        return {
            domains: domains.map((d) => ({ id: d || '', label: d || '' })),
            users: users.map((u) => ({ id: u || '', label: u || '' })),
            providers: providers.map((p) => ({ id: p || '', label: p || '' })),
            statuses: statuses.map((s) => ({ id: s || '', label: s || '' })),
            entityTypes: entityTypes.map((et) => ({ id: et || '', label: et || '' })),
            apps: apps.map((a) => ({ id: a || '', label: a || '' })),
            departments: departments.map((d) => ({ id: d || '', label: d || '' })),
            types: types.map((t) => ({ id: t || '', label: t || '' })),
            models: models.map((m) => ({ id: m || '', label: m || '' })),
        };
    }, [aiEntities]);

    // Фильтрация данных
    const filteredAiEntities = React.useMemo(() => {
        if (!aiEntities) return [];

        return aiEntities.filter((ai) => {
            // Поиск по тексту
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesResult = ai.result?.toLowerCase().includes(searchLower);
                const matchesUserName = ai.user_name?.toLowerCase().includes(searchLower);
                const matchesEntityName = ai.entity_name?.toLowerCase().includes(searchLower);
                const matchesDomain = ai.domain?.toLowerCase().includes(searchLower);
                if (!matchesResult && !matchesUserName && !matchesEntityName && !matchesDomain) {
                    return false;
                }
            }

            // Фильтр по доменам
            if (filters.selectedDomains.length > 0) {
                if (!filters.selectedDomains.includes(ai.domain || '')) {
                    return false;
                }
            }

            // Фильтр по пользователям
            if (filters.selectedUsers.length > 0) {
                const userId = ai.user_id?.toString() || '';
                if (!filters.selectedUsers.includes(userId)) {
                    return false;
                }
            }

            // Фильтр по провайдерам
            if (filters.selectedProviders.length > 0) {
                if (!filters.selectedProviders.includes(ai.provider || '')) {
                    return false;
                }
            }

            // Фильтр по статусам
            if (filters.selectedStatuses.length > 0) {
                if (!filters.selectedStatuses.includes(ai.status || '')) {
                    return false;
                }
            }

            // Фильтр по типам сущностей
            if (filters.selectedEntityTypes.length > 0) {
                if (!filters.selectedEntityTypes.includes(ai.entity_type || '')) {
                    return false;
                }
            }

            // Фильтр по приложениям
            if (filters.selectedApps.length > 0) {
                if (!filters.selectedApps.includes(ai.app || '')) {
                    return false;
                }
            }

            // Фильтр по отделам
            if (filters.selectedDepartments.length > 0) {
                if (!filters.selectedDepartments.includes(ai.department || '')) {
                    return false;
                }
            }

            // Фильтр по типам
            if (filters.selectedTypes.length > 0) {
                if (!filters.selectedTypes.includes(ai.type || '')) {
                    return false;
                }
            }

            // Фильтр по моделям
            if (filters.selectedModels.length > 0) {
                if (!filters.selectedModels.includes(ai.model || '')) {
                    return false;
                }
            }

            // Фильтр по дате создания (от)
            if (filters.dateFrom) {
                const dateFrom = new Date(filters.dateFrom);
                const createdAt = ai.createdAt ? new Date(ai.createdAt) : null;
                if (!createdAt || createdAt < dateFrom) {
                    return false;
                }
            }

            // Фильтр по дате создания (до)
            if (filters.dateTo) {
                const dateTo = new Date(filters.dateTo);
                dateTo.setHours(23, 59, 59, 999); // Включаем весь день
                const createdAt = ai.createdAt ? new Date(ai.createdAt) : null;
                if (!createdAt || createdAt > dateTo) {
                    return false;
                }
            }

            return true;
        });
    }, [aiEntities, filters]);

    return {
        filters,
        setFilters,
        filteredAiEntities,
        filterOptions,
    };
}
