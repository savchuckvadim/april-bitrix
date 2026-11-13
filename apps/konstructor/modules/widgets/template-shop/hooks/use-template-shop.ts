'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    initializeWordTemplates,
    useWordTemplate,
    type WordTemplate,
    type WordTemplateSummary,
} from '@/modules/entities/offer-template-word';
import {
    filterShopTemplates,
    type TemplateShopScope,
    type TemplateShopViewer,
} from '../lib/template-shop.util';

/** Не больше 10 своих шаблонов (лимит бэка). */
const OWN_TEMPLATES_LIMIT = 10;

/**
 * Витрина шаблонов КП: общедоступные, портала и свои одним списком,
 * вкладки и поиск, выбор текущего, избранное, скачивание, удаление.
 */
export const useTemplateShop = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const word = useWordTemplate();
    const { publicTemplates, portalTemplates, userTemplates, selectedTemplate, favorites, isInitialized, isLoading } =
        useAppSelector(state => state.offerTemplateWord);
    const isSuperUser = useAppSelector(state => state.app.isSuperUser);
    const userId = useAppSelector(state => Number(state.app.bitrix.user?.ID) || 0);
    const [scope, setScope] = useState<TemplateShopScope>('all');
    const [search, setSearch] = useState('');
    const [previewOf, setPreviewOf] = useState<WordTemplateSummary | null>(null);

    useEffect(() => {
        if (!isInitialized && !isLoading) void dispatch(initializeWordTemplates());
    }, [isInitialized, isLoading, dispatch]);

    const all = useMemo(
        () =>
            [...publicTemplates, ...portalTemplates, ...userTemplates].filter(
                (template, index, list) => list.findIndex(other => other.id === template.id) === index,
            ),
        [publicTemplates, portalTemplates, userTemplates],
    );
    const viewer: TemplateShopViewer = useMemo(
        () => ({
            userId,
            isSuperUser,
            favorites,
            selectedId: selectedTemplate ? String(selectedTemplate.id) : null,
        }),
        [userId, isSuperUser, favorites, selectedTemplate],
    );
    const items = useMemo(() => filterShopTemplates(all, scope, search, viewer), [all, scope, search, viewer]);

    return {
        isLoading: !isInitialized || isLoading,
        items,
        total: all.length,
        viewer,
        scope,
        setScope,
        search,
        setSearch,
        canAdd: userTemplates.length < OWN_TEMPLATES_LIMIT,
        previewOf,
        openPreview: setPreviewOf,
        closePreview: () => setPreviewOf(null),
        back: () => router.back(),
        select: (template: WordTemplateSummary) => {
            word.setCurrent(template as WordTemplate);
            toast.success(`Шаблон «${template.name}» выбран для КП`);
        },
        toggleFavorite: (template: WordTemplateSummary) => word.toggleFavorite(String(template.id)),
        download: (template: WordTemplateSummary) =>
            void word.download(String(template.id), template.name).catch(() => toast.error('Не удалось скачать шаблон')),
        // подтверждение тостом с действием — вместо модального confirm
        remove: (template: WordTemplateSummary) =>
            toast(`Удалить шаблон «${template.name}»?`, {
                action: { label: 'Удалить', onClick: () => word.remove({ id: String(template.id) }) },
            }),
    };
};
