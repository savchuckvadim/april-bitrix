import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
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
        const field = findEnumField(getState(), contactId, fieldCode);
        if (!field) return;

        const currentIndex = field.items.findIndex(item => {
            const current = field.current;
            return (
                current && typeof current === 'object' && item.code === current.code
            );
        });
        await dispatch(
            setPbxContactField(
                contactId,
                fieldCode,
                (currentIndex + 1) % field.items.length,
            ),
        );
    };

/**
 * Установка КОНКРЕТНОГО значения по индексу — клик по делению шкалы
 * характеристики (паттерн кликабельного прогресса из «конструктора»).
 * Оптимистично + crm.contact.update.
 */
export const setPbxContactField =
    (contactId: number, fieldCode: string, itemIndex: number) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const field = findEnumField(getState(), contactId, fieldCode);
        const nextItem = field?.items[itemIndex];
        if (!field || !nextItem) return;

        dispatch(
            eventContactActions.setContactFieldCurrent({
                contactId,
                fieldCode,
                current: nextItem as PBXContactFieldData['current'],
            }),
        );

        await Bitrix.getService().contact.update(contactId, {
            [field.bitrixId]: nextItem.bitrixId,
        } as never);
    };

/** Поле контакта, пригодное к выбору значения (ENUM/SELECT с items). */
const findEnumField = (
    state: ReturnType<AppGetState>,
    contactId: number,
    fieldCode: string,
): PBXContactFieldData | null => {
    const contact = state.contact.contacts.find(item => item.ID == contactId);
    const field = contact?.fields.find(f => f.field.code === fieldCode);
    if (!field || !field.items.length) return null;
    // Строки редактируются формой контакта, не шкалой.
    return field.field.type === PBX_FIELD_TYPE.ENUM ||
        field.field.type === PBX_FIELD_TYPE.SELECT
        ? field
        : null;
};
