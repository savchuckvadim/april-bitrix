import type { DemoRequest } from '@/app/(landing)/platform/model/demo-request';
import type { SiteLeadPayload } from '../../_site-inbox/site-inbox-backend';

/** Заявка на демо с раздела /platform → заявка бэка вида «демо». */
export const toDemoLead = (request: DemoRequest): SiteLeadPayload => ({
    kind: 'demo',
    name: request.name,
    phone: request.phone,
    company: request.company,
    comment: request.comment,
    page: request.page,
});
