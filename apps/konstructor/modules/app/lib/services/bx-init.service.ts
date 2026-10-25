import { Bitrix } from '@bitrix/bitrix';
import { BitrixService } from '@bitrix/bitrix.service';
import { IBXCompany, IBXDeal } from '@bitrix/index';
import { BxDealCompanyService } from './bx-deal-compny.service';

export interface IBitrixinitResult {
    deal: IBXDeal;
    /** null — у сделки не указана компания: конструктор в такой сделке работать не может. */
    company: IBXCompany | null;
}

interface IBitrixinitResponse {
    dealGet: IBXDeal;
    companyGet: IBXCompany;
}

/** Сделка и её компания одним batch-запросом. dealId резолвит app-init из placement. */
export class BxInitService {
    private bitrix: BitrixService;
    private dealCompanyService: BxDealCompanyService;

    constructor() {
        this.bitrix = Bitrix.getService();
        this.dealCompanyService = new BxDealCompanyService();
    }

    public async init(dealId: number): Promise<IBitrixinitResult | null> {
        this.dealCompanyService.getDealAndCompanyComand(dealId);

        const totalBxResponse =
            (await this.bitrix.api.callBatch()) as IBitrixinitResponse;

        const deal = totalBxResponse.dealGet;
        // null возвращаем только когда нет самой сделки: «сделка без компании» —
        // отдельный случай, вызывающий код показывает по нему свой экран
        if (!deal) {
            return null;
        }

        return { deal, company: totalBxResponse.companyGet ?? null };
    }
}
