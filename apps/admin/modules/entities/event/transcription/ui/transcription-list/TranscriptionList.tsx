'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { TranscriptionEntity } from '../../model';
import {
    useTranscriptions,
    useTranscriptionsByDomain,
    useTranscriptionsByDomainAndUser,
    useTranscriptionFilter
} from '../../lib/hooks';
import { TranscriptionTable } from '../transcription-table/TranscriptionTable';
import { TranscriptionFilter } from './components/TranscriptionFilter';
import { TRANSCRIPTION_PATH } from '../../consts/transcription.consts';

interface TranscriptionListProps {
    domain?: string;
    userId?: string;
    basePath?: string; // Базовый путь для навигации (для портала или общей страницы)
}

export function TranscriptionList({ domain, userId, basePath }: TranscriptionListProps) {
    const router = useRouter();

    // Используем соответствующий хук в зависимости от параметров
    const allTranscriptions = useTranscriptions();
    const domainTranscriptions = useTranscriptionsByDomain(domain || '');
    const domainAndUserTranscriptions = useTranscriptionsByDomainAndUser(domain || '', userId || '');

    // Определяем, какой источник данных использовать
    let transcriptions: TranscriptionEntity[] | undefined;
    let isLoading: boolean;

    if (domain && userId) {
        transcriptions = domainAndUserTranscriptions.data;
        isLoading = domainAndUserTranscriptions.isLoading;
    } else if (domain) {
        transcriptions = domainTranscriptions.data;
        isLoading = domainTranscriptions.isLoading;
    } else {
        transcriptions = allTranscriptions.data;
        isLoading = allTranscriptions.isLoading;
    }

    const { filters, setFilters, filteredTranscriptions, filterOptions } = useTranscriptionFilter(transcriptions);

    // Определяем путь для навигации
    const navigationPath = basePath || TRANSCRIPTION_PATH;

    const handleRowClick = (transcription: TranscriptionEntity) => {
        router.push(`${navigationPath}/${transcription.id}`);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                    Транскрипции
                    {domain && <span className="text-lg text-muted-foreground ml-2">({domain})</span>}
                    {userId && <span className="text-lg text-muted-foreground ml-2">- {userId}</span>}
                </h1>
            </div>

            <TranscriptionFilter
                filters={filters}
                onFiltersChange={setFilters}
                filterOptions={filterOptions}
            />

            <TranscriptionTable
                data={filteredTranscriptions}
                isLoading={isLoading}
                onRowClick={handleRowClick}
            />
        </div>
    );
}
