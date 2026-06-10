'use client';

import * as React from 'react';
import { TranscriptionEntity } from '../../model';

/**
 * Состояние фильтров для транскрипций
 */
export interface TranscriptionFilterState {
    search: string;
    selectedDomains: string[];
    selectedUsers: string[];
    selectedProviders: string[];
    selectedStatuses: string[];
    selectedEntityTypes: string[];
    selectedApps: string[];
    selectedDepartments: string[];
}

/**
 * Хук для управления фильтрацией транскрипций
 * Инкапсулирует логику фильтрации данных по различным критериям
 */
export function useTranscriptionFilter(transcriptions: TranscriptionEntity[] | undefined) {
    const [filters, setFilters] = React.useState<TranscriptionFilterState>({
        search: '',
        selectedDomains: [],
        selectedUsers: [],
        selectedProviders: [],
        selectedStatuses: [],
        selectedEntityTypes: [],
        selectedApps: [],
        selectedDepartments: [],
    });

    // Получаем уникальные значения для опций фильтров
    const filterOptions = React.useMemo(() => {
        if (!transcriptions) {
            return {
                domains: [],
                users: [],
                providers: [],
                statuses: [],
                entityTypes: [],
                apps: [],
                departments: [],
            };
        }

        const domains = Array.from(new Set(transcriptions.map((t) => t.domain).filter(Boolean)));
        const users = Array.from(new Set(transcriptions.map((t) => t.userId).filter(Boolean)));
        const providers = Array.from(new Set(transcriptions.map((t) => t.provider).filter(Boolean)));
        const statuses = Array.from(new Set(transcriptions.map((t) => t.status).filter(Boolean)));
        const entityTypes = Array.from(new Set(transcriptions.map((t) => t.entityType).filter(Boolean)));
        const apps = Array.from(new Set(transcriptions.map((t) => t.app).filter(Boolean)));
        const departments = Array.from(new Set(transcriptions.map((t) => t.department).filter(Boolean)));

        return {
            domains: domains.map((d) => ({ id: d, label: d })),
            users: users.map((u) => ({ id: u, label: u })),
            providers: providers.map((p) => ({ id: p, label: p })),
            statuses: statuses.map((s) => ({ id: s, label: s })),
            entityTypes: entityTypes.map((et) => ({ id: et, label: et })),
            apps: apps.map((a) => ({ id: a, label: a })),
            departments: departments.map((d) => ({ id: d, label: d })),
        };
    }, [transcriptions]);

    // Фильтрация данных
    const filteredTranscriptions = React.useMemo(() => {
        if (!transcriptions) return [];

        return transcriptions.filter((transcription) => {
            // Поиск по тексту
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesText = transcription.text?.toLowerCase().includes(searchLower);
                const matchesUserName = transcription.userName?.toLowerCase().includes(searchLower);
                const matchesEntityName = transcription.entityName?.toLowerCase().includes(searchLower);
                const matchesDomain = transcription.domain?.toLowerCase().includes(searchLower);
                if (!matchesText && !matchesUserName && !matchesEntityName && !matchesDomain) {
                    return false;
                }
            }

            // Фильтр по доменам
            if (filters.selectedDomains.length > 0) {
                if (!filters.selectedDomains.includes(transcription.domain || '')) {
                    return false;
                }
            }

            // Фильтр по пользователям
            if (filters.selectedUsers.length > 0) {
                if (!filters.selectedUsers.includes(transcription.userId || '')) {
                    return false;
                }
            }

            // Фильтр по провайдерам
            if (filters.selectedProviders.length > 0) {
                if (!filters.selectedProviders.includes(transcription.provider || '')) {
                    return false;
                }
            }

            // Фильтр по статусам
            if (filters.selectedStatuses.length > 0) {
                if (!filters.selectedStatuses.includes(transcription.status || '')) {
                    return false;
                }
            }

            // Фильтр по типам сущностей
            if (filters.selectedEntityTypes.length > 0) {
                if (!filters.selectedEntityTypes.includes(transcription.entityType || '')) {
                    return false;
                }
            }

            // Фильтр по приложениям
            if (filters.selectedApps.length > 0) {
                if (!filters.selectedApps.includes(transcription.app || '')) {
                    return false;
                }
            }

            // Фильтр по отделам
            if (filters.selectedDepartments.length > 0) {
                if (!filters.selectedDepartments.includes(transcription.department || '')) {
                    return false;
                }
            }

            return true;
        });
    }, [transcriptions, filters]);

    return {
        filters,
        setFilters,
        filteredTranscriptions,
        filterOptions,
    };
}
