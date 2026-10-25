import type { IBXUser } from '@bitrix/domain/interfaces/bitrix.interface';
import type { OfferManager } from '../../document-payload';

/** Менеджер в подписи КП — текущий пользователь Битрикса (легаси getDocumentUserByBxUser). */
export const managerFromBxUser = (user: IBXUser | null | undefined): OfferManager => ({
    name: [user?.NAME, user?.LAST_NAME].filter(Boolean).join(' ').trim(),
    email: user?.EMAIL ?? '',
    phone: user?.WORK_PHONE || user?.PERSONAL_MOBILE || '',
    position: user?.WORK_POSITION ?? '',
});
