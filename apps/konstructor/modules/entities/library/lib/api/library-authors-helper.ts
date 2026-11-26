import { Bitrix } from '@workspace/bitrix';
import { namesByUserId } from '../library-author.util';

/** `user.get` отдаёт до 50 человек за страницу, поэтому длинный список режем. */
const PORTAL_PAGE_SIZE = 50;

/**
 * Имена авторов заготовок из портала Битрикса: типизированный `user.getByIds`
 * из @workspace/bitrix — ЕДИНСТВЕННОЕ место, где библиотека спрашивает людей.
 */
export class LibraryAuthorsHelper {
    /** id → «Имя Фамилия» одним запросом на страницу из 50 человек. */
    async names(ids: number[]): Promise<Record<number, string>> {
        const user = Bitrix.getService().user;
        const pages: number[][] = [];
        for (let from = 0; from < ids.length; from += PORTAL_PAGE_SIZE) {
            pages.push(ids.slice(from, from + PORTAL_PAGE_SIZE));
        }
        const users = await Promise.all(pages.map(page => user.getByIds(page)));
        return namesByUserId(users.flat());
    }
}
