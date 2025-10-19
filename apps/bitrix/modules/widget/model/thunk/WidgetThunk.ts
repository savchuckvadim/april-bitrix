import { AppThunk } from '../../../app/model/store';
import { widgetActions } from '../slice/WidgetSlice';
import { BitrixPlacement, BitrixSetting } from '../types';

export const loadPlacementsThunk = (appId: bigint): AppThunk => async (dispatch) => {
    dispatch(widgetActions.setLoading(true));
    dispatch(widgetActions.clearError());

    try {
        // Имитация загрузки виджетов
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockPlacements: BitrixPlacement[] = [
            {
                id: BigInt(1),
                bitrix_app_id: appId,
                code: 'crm_deal_tab',
                type: 'crm_tab',
                group: 'sales',
                status: 'installed',
                bitrix_handler: 'https://app.example.com/bitrix/crm_deal_tab',
                public_handler: 'https://app.example.com/public/crm_deal_tab',
                bitrix_codes: 'BX.CrmDealTab',
                bitrix_app: undefined,
                settings: [],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: BigInt(2),
                bitrix_app_id: appId,
                code: 'crm_deal_button',
                type: 'crm_button',
                group: 'sales',
                status: 'installing',
                bitrix_handler: 'https://app.example.com/bitrix/crm_deal_button',
                public_handler: 'https://app.example.com/public/crm_deal_button',
                bitrix_codes: 'BX.CrmDealButton',
                bitrix_app: undefined,
                settings: [],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: BigInt(3),
                bitrix_app_id: appId,
                code: 'crm_deal_widget',
                type: 'crm_widget',
                group: 'sales',
                status: 'error',
                bitrix_handler: 'https://app.example.com/bitrix/crm_deal_widget',
                public_handler: 'https://app.example.com/public/crm_deal_widget',
                bitrix_codes: 'BX.CrmDealWidget',
                bitrix_app: undefined,
                settings: [],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        dispatch(widgetActions.setPlacements(mockPlacements));
        dispatch(widgetActions.setLoading(false));
    } catch (error) {
        dispatch(widgetActions.setError('Ошибка загрузки виджетов'));
        dispatch(widgetActions.setLoading(false));
    }
};

export const installPlacementThunk = (placementId: bigint): AppThunk => async (dispatch) => {
    dispatch(widgetActions.updatePlacementStatus({ id: placementId, status: 'installing' }));

    try {
        // Имитация установки виджета
        await new Promise(resolve => setTimeout(resolve, 2000));
        dispatch(widgetActions.updatePlacementStatus({ id: placementId, status: 'installed' }));
    } catch (error) {
        dispatch(widgetActions.updatePlacementStatus({ id: placementId, status: 'error' }));
        dispatch(widgetActions.setError('Ошибка установки виджета'));
    }
};

export const uninstallPlacementThunk = (placementId: bigint): AppThunk => async (dispatch) => {
    try {
        // Имитация удаления виджета
        await new Promise(resolve => setTimeout(resolve, 1000));
        dispatch(widgetActions.updatePlacementStatus({ id: placementId, status: 'not_installed' }));
    } catch (error) {
        dispatch(widgetActions.setError('Ошибка удаления виджета'));
    }
};

export const reinstallPlacementThunk = (placementId: bigint): AppThunk => async (dispatch) => {
    dispatch(widgetActions.updatePlacementStatus({ id: placementId, status: 'installing' }));

    try {
        // Имитация переустановки виджета
        await new Promise(resolve => setTimeout(resolve, 3000));
        dispatch(widgetActions.updatePlacementStatus({ id: placementId, status: 'installed' }));
    } catch (error) {
        dispatch(widgetActions.updatePlacementStatus({ id: placementId, status: 'error' }));
        dispatch(widgetActions.setError('Ошибка переустановки виджета'));
    }
};

export const savePlacementSettingsThunk = (placementId: bigint, settings: BitrixSetting[]): AppThunk => async (dispatch) => {
    try {
        // Имитация сохранения настроек
        await new Promise(resolve => setTimeout(resolve, 1000));
        dispatch(widgetActions.updatePlacementSettings({ id: placementId, settings }));
    } catch (error) {
        dispatch(widgetActions.setError('Ошибка сохранения настроек'));
    }
};
