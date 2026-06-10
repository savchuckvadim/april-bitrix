import { BxInitService, IBitrixinitResult } from '../../services/bx-init.service';

export const bitrixInit = async (): Promise<IBitrixinitResult | null> => {
    const bxInitService = new BxInitService();

    const result = await bxInitService.init();

    if (!result) {
        return null;
    }
    const { deal, company } = result;

    return { deal, company };
};
