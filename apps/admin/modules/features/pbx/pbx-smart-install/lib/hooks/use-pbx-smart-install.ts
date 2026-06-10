'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app';
import { useSmarts } from '@/modules/entities/portal-bitrix/btx-smarts/lib/hooks';
import { useBtxCategories } from '@/modules/entities/portal-bitrix/btx-categories/lib/hooks';
import { useBitrixFields } from '@/modules/entities/portal-bitrix/bitrix-fields/lib/hooks';
import {
    getAllSmartTemplates,
    findSmartTemplate,
} from '../selectors/smart-template-selectors';
import { diffAllSmarts, diffSmart } from '../diff/diff-smart';
import type { PbxSmartInstallContext, PbxSmartDiffNode } from '../../model/types';

// ---------------------------------------------------------------------------
// Portal-level overview: all smarts from template vs. all installed on portal
// ---------------------------------------------------------------------------

/**
 * Returns a diff of every smart defined in the registry vs. what is
 * installed on the given portal. Suitable for the smarts-list page.
 */
export function usePbxSmartInstallOverview(portalId: number) {
    const allData = useAppSelector((s) => s.pbxTemplateData.allData);
    const templateInitialized = useAppSelector(
        (s) => s.pbxTemplateData.initialized,
    );

    const { data: installedSmarts = [], isLoading: smartsLoading } =
        useSmarts(portalId);

    const templateSmarts = useMemo(
        () => getAllSmartTemplates(allData),
        [allData],
    );

    const diffNodes = useMemo<PbxSmartDiffNode[]>(
        () =>
            diffAllSmarts(
                templateSmarts,
                Array.isArray(installedSmarts) ? installedSmarts : [],
            ),
        [templateSmarts, installedSmarts],
    );

    return {
        diffNodes,
        isLoading: !templateInitialized || smartsLoading,
        templateSmarts,
    };
}

// ---------------------------------------------------------------------------
// Smart-level detail: full diff tree for a single smart (categories + fields)
// ---------------------------------------------------------------------------

/**
 * Returns the full diff tree for a single smart — categories with stages
 * and fields with items — against the installed data on the portal.
 *
 * Pass this hook's result into `SmartPbxOverviewTab`.
 */
export function usePbxSmartDetail(context: PbxSmartInstallContext) {
    const { portalId, group, smartCode, smartId } = context;

    const allData = useAppSelector((s) => s.pbxTemplateData.allData);
    const templateInitialized = useAppSelector(
        (s) => s.pbxTemplateData.initialized,
    );

    const { data: installedSmarts = [], isLoading: smartsLoading } =
        useSmarts(portalId);

    // Categories for this smart (only fetch when smart is installed in our DB)
    const { data: rawCategories, isLoading: categoriesLoading } =
        useBtxCategories(
            smartId
                ? { entityType: 'smart' as const, entityId: smartId }
                : (undefined as any), // eslint-disable-line @typescript-eslint/no-explicit-any
        );
    const installedCategories = Array.isArray(rawCategories)
        ? rawCategories
        : [];

    // Fields for this smart (only fetch when smart is installed in our DB)
    const { data: rawFields, isLoading: fieldsLoading } = useBitrixFields(
        smartId
            ? { entityType: 'smart' as const, entityId: smartId }
            : undefined,
    );
    const installedFields = Array.isArray(rawFields) ? rawFields : [];

    const templateSmart = useMemo(
        () => findSmartTemplate(allData, group, smartCode),
        [allData, group, smartCode],
    );

    const diffNode = useMemo<PbxSmartDiffNode | null>(() => {
        if (!templateSmart) return null;
        return diffSmart(
            templateSmart,
            group,
            Array.isArray(installedSmarts) ? installedSmarts : [],
            installedCategories,
            installedFields,
        );
    }, [
        templateSmart,
        group,
        installedSmarts,
        installedCategories,
        installedFields,
    ]);

    return {
        diffNode,
        templateSmart,
        isLoading:
            !templateInitialized ||
            smartsLoading ||
            (!!smartId && (categoriesLoading || fieldsLoading)),
    };
}
