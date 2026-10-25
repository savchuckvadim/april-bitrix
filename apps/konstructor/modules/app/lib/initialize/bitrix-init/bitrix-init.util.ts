import { BxInitService, IBitrixinitResult } from '../../services/bx-init.service';

/** Сделка и компания по известному dealId (placement разобран в app-init). */
export const bitrixInit = async (dealId: number): Promise<IBitrixinitResult | null> => {
    const bxInitService = new BxInitService();
    return bxInitService.init(dealId);
};
