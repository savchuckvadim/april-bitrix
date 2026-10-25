import { Bitrix } from '@bitrix/bitrix';
import { BitrixService } from '@bitrix/bitrix.service';

/** Batch-команды «сделка → её компания» (companyId берётся из результата dealGet). */
export class BxDealCompanyService {
    private bitrix: BitrixService;

    constructor() {
        this.bitrix = Bitrix.getService();
    }

    public getDealAndCompanyComand(dealId: number) {
        this.bitrix.batch.deal.get('dealGet', dealId);
        this.bitrix.batch.company.get('companyGet', '$result[dealGet][COMPANY_ID]');
    }
}
