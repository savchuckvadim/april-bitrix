import { Bitrix } from '@bitrix/bitrix';
import { BitrixService } from '@bitrix/bitrix.service';
import { TESTING_PLACEMENT } from '../../consts/app-global';
import { Placement } from '@workspace/bx';


export class BxDealCompanyService {
    private bitrix: BitrixService;

    constructor() {
        this.bitrix = Bitrix.getService();
    }

    public async getDealAndCompanyComand(dealId: number) {

        this.bitrix.batch.deal.get('dealGet', dealId);

        const companyId = `$result[dealGet][COMPANY_ID]`;
        this.bitrix.batch.company.get('companyGet', companyId);

    }

    private getPlacement() {
        return (
            this.bitrix.api.getPlacement() || (TESTING_PLACEMENT as Placement)
        );
    }
}
