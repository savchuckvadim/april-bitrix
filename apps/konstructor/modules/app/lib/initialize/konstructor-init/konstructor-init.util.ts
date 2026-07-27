import { AppDispatch } from '../../../model/store';
import { initCatalog } from '@/modules/entities/catalog';

/**
 * Инициализация каталога конструктора из init v2
 * (POST /api/konstructor/init/data, @workspace/nest-konstructor-api).
 * Каталог целиком на code-джойнах; localStorage-кэш легаси-init убран —
 * вернём с версионированием, когда объём ответа это оправдает.
 */
export const getInitializeData = async (
    dispatch: AppDispatch,
    domain: string,
): Promise<void> => {
    await dispatch(initCatalog({ domain }));
};
