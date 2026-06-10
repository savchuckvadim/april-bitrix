import { Bitrix } from '@bitrix/bitrix';
import { BitrixService } from '@bitrix/bitrix.service';
import { IS_PROD, TESTING_PLACEMENT } from '../../consts/app-global';
import { Placement } from '@workspace/bx';
import { IBXCompany, IBXDeal, IBXItem } from '@bitrix/index';

import { BxDealCompanyService } from './bx-deal-compny.service';



export interface IBitrixinitResult {
    deal: IBXDeal;
    company: IBXCompany;


}
interface IBitrixinitResponse {
    dealGet: IBXDeal;
    companyGet: IBXCompany;
    participants: {
        items: IBXItem[];
    };
}
export class BxInitService {
    private bitrix: BitrixService;
    private dealCompanyService: BxDealCompanyService;

    constructor() {
        this.bitrix = Bitrix.getService();
        this.dealCompanyService = new BxDealCompanyService();


        const { inFrame } = this.bitrix.api.getInitializedData();

        if (!inFrame && IS_PROD) {
            window.location.href = '/none-auth';
            return;
        }
    }

    public async init(): Promise<IBitrixinitResult | null> {
        const dealId = await this.getDealId();
        //TODO: переделать сейчас сделано как будто по любому из сделки открывается
        // но может открываться и и з Компании и тогда все упадет

        this.dealCompanyService.getDealAndCompanyComand(Number(dealId));


        const totalBxResponse =
            (await this.bitrix.api.callBatch()) as IBitrixinitResponse;

        const { company, deal } = this.prepare(totalBxResponse);

        if (!company) {
            return null;
        }

        return { deal, company} as IBitrixinitResult;
    }

    private getPlacement() {
        return (
            this.bitrix.api.getPlacement() || (TESTING_PLACEMENT as Placement)
        );
    }

    private async getDealId(): Promise<number> {
        //TODO смотря что за placement type - compane или deal будут обязательными
        const placement = this.getPlacement();
        const dealId =
            'ID' in placement.options
                ? placement.options.ID
                : 'dealId' in placement.options
                  ? placement.options.dealId
                  : null;
        if (!dealId) {
            throw new Error('Deal ID not found in placement options');
        }
        return Number(dealId) as number;
    }

    private prepare(totalBxResponse: IBitrixinitResponse): {
        deal: IBXDeal;
        company: IBXCompany;

    } {
        const deal = totalBxResponse.dealGet;
        const company = totalBxResponse.companyGet;
        return { deal, company };
    }
}
