import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { Bitrix } from '@workspace/bitrix';
import { eventContactActions } from '@/modules/entities/EventContact';
import {
    PBX_FIELD_TYPE,
    PBXContactFieldData,
} from '@/modules/entities/EventContact/type/pbx-contact-type';

/**
 * Обновление портального поля контакта (ЛПР, статус клиента и т.п.).
 * Работает поверх состояния entities/EventContact (в legacy был дубль-слайс
 * pbxContact — здесь состояние одно). ENUM/SELECT — циклический переход
 * к следующему значению; оптимистично + crm.contact.update.
 */
export const updatePbxContactField =
    (contactId: number, fieldCode: string) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const contact = getState().contact.contacts.find(
            item => item.ID == contactId,
        );
        const field = contact?.fields.find(f => f.field.code === fieldCode);
        if (!contact || !field) return;

        let nextCurrent: PBXContactFieldData['current'] = field.current;
        let bitrixValue: string | number = '';

        if (
            field.field.type === PBX_FIELD_TYPE.ENUM ||
            field.field.type === PBX_FIELD_TYPE.SELECT
        ) {
            const items = field.items;
            if (!items.length) return;
            const currentIndex = items.findIndex(item => {
                const current = field.current;
                return (
                    current &&
                    typeof current === 'object' &&
                    item.code === current.code
                );
            });
            const nextItem = items[(currentIndex + 1) % items.length]!;
            nextCurrent = nextItem;
            bitrixValue = nextItem.bitrixId;
        } else {
            return; // строки редактируются через setBaseProp / форму контакта
        }

        dispatch(
            eventContactActions.setContactFieldCurrent({
                contactId,
                fieldCode,
                current: nextCurrent,
            }),
        );

        await Bitrix.getService().api.call('crm.contact.update', {
            ID: contactId,
            fields: { [field.bitrixId]: bitrixValue },
        });
    };
