'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LeadStagesHelper } from '../api/lead-stages-helper';
import type { MapLeadStageItem } from '../../model';
import type { PbxGroup } from '../../../../lib/model/common';

const helper = new LeadStagesHelper();
const KEY = ['pbx-lead-stages'] as const;

/** Экран сопоставления стадий лида для домена и группы. */
export const useLeadStageMapping = (domain?: string, group?: PbxGroup) =>
    useQuery({
        queryKey: [...KEY, 'screen', domain, group],
        queryFn: () => helper.getMappingScreen(domain as string, group as PbxGroup),
        enabled: !!domain && !!group,
    });

/** Сохранить сопоставление стадий с STATUS_ID Bitrix. */
export const useMapLeadStages = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: {
            domain: string;
            group: PbxGroup;
            mappings: MapLeadStageItem[];
        }) => helper.mapStages(vars.domain, vars.group, vars.mappings),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};
