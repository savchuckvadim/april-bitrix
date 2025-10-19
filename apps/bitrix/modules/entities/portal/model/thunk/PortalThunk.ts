import { AppThunk } from '../../../../app/model/store';
import { portalActions } from '../slice/PortalSlice';
import { PortalForm, Portal, BitrixApp } from '../types';

export const addPortalThunk = (form: PortalForm): AppThunk => async (dispatch) => {
    dispatch(portalActions.setLoading(true));
    dispatch(portalActions.clearError());

    try {
        // Валидация домена
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.bitrix24\.(ru|com|ua|kz|by)$/;
        if (!domainRegex.test(form.domain)) {
            dispatch(portalActions.setError('Неверный формат домена. Используйте: your-portal.bitrix24.ru'));
            return;
        }

        // Имитация API вызова
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newPortal: Portal = {
            id: BigInt(Date.now()),
            domain: form.domain,
            name: form.name,
            isActive: true,
            bitrixApps: [],
            createdAt: new Date()
        };

        dispatch(portalActions.addPortal(newPortal));
        dispatch(portalActions.setLoading(false));
    } catch (error) {
        dispatch(portalActions.setError('Ошибка добавления портала'));
        dispatch(portalActions.setLoading(false));
    }
};

export const createAppThunk = (portalId: bigint, group: string, clientId: string, clientSecret: string): AppThunk => async (dispatch) => {
    dispatch(portalActions.setLoading(true));
    dispatch(portalActions.clearError());

    try {
        // Имитация API вызова
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newApp: BitrixApp = {
            id: BigInt(Date.now()),
            portal_id: portalId,
            group: group as 'sales' | 'service' | 'marketing' | 'support' | 'analytics',
            type: 'widget',
            code: `${group}_app_${Date.now()}`,
            status: 'not_installed',
            bitrix_tokens: {
                id: BigInt(Date.now() + 1),
                bitrix_app_id: BigInt(Date.now()),
                client_id: clientId,
                client_secret: clientSecret,
                access_token: '',
                refresh_token: '',
                expires_at: new Date(Date.now() + 3600000),
                application_token: '',
                member_id: '',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            placements: [],
            settings: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        dispatch(portalActions.addAppToPortal({ portalId, app: newApp }));
        dispatch(portalActions.setLoading(false));
    } catch (error) {
        dispatch(portalActions.setError('Ошибка создания приложения'));
        dispatch(portalActions.setLoading(false));
    }
};

export const loadPortalsThunk = (): AppThunk => async (dispatch) => {
    dispatch(portalActions.setLoading(true));
    dispatch(portalActions.clearError());

    try {
        // Имитация загрузки порталов
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockPortals: Portal[] = [
            {
                id: BigInt(1),
                domain: 'my-portal.bitrix24.ru',
                name: 'Мой портал',
                isActive: true,
                bitrixApps: [],
                createdAt: new Date()
            }
        ];

        dispatch(portalActions.setPortals(mockPortals));
        dispatch(portalActions.setLoading(false));
    } catch (error) {
        dispatch(portalActions.setError('Ошибка загрузки порталов'));
        dispatch(portalActions.setLoading(false));
    }
};
