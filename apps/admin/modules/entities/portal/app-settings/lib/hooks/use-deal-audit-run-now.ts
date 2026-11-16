'use client';

import { useMutation } from '@tanstack/react-query';
import { DealAuditRunHelper } from '../api/deal-audit-run.helper';

const helper = new DealAuditRunHelper();

/** Ручной прогон аудита сделок: результат показывается по ответу ручки. */
export const useDealAuditRunNow = () =>
    useMutation({
        mutationFn: (portalId: number) => helper.runNow(portalId),
    });
