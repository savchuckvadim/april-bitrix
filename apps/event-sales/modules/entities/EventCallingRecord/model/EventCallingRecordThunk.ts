import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { eventCallingRecordActions } from './EventCallingRecordSlice';
import { EVCallingRecord } from './index';
import { RecordsHelper } from '../lib/api/records-helper';

const recordsHelper = new RecordsHelper();

/** Записи звонков по компании (гейт withRecords — на вызывающей стороне UI). */
export const getAudioRecords =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        if (state.eventCallingRecord.isLoading) return;

        const companyId = Number(state.app.bitrix.company?.ID || 0);
        const domain = state.app.domain;
        if (!companyId || !domain) return;

        // generated DTO ждёт string[] (см. BxRecordsByCompanyRequestDto на бэке)
        const contactIds = state.contact.contacts
            .map(contact => String(contact.ID))
            .filter(Boolean);

        dispatch(eventCallingRecordActions.setLoadingStatus({ status: true }));
        try {
            const records = await recordsHelper.getRecordsByCompany({
                domain,
                companyId,
                contactIds,
            });
            const items: EVCallingRecord[] = (records ?? []).map(record => ({
                ...record,
                isPlaying: false,
            }));
            dispatch(eventCallingRecordActions.setFiles({ records: items }));
        } catch (error) {
            console.error('getAudioRecords error', error);
            dispatch(eventCallingRecordActions.setFiles({ records: [] }));
        }
    };
