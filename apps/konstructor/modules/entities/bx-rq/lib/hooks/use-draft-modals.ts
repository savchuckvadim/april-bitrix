'use client';

import { useApp } from '@/modules/app/lib/hooks/app';
import { useClientType } from '@/modules/entities/deal/lib/hooks/use-client-type';
import { addressTitle } from '../address-util';
import { useBxRqEditAddress, useBxRqEditBank, useBxRqEditBase } from './use-bx-rq';

/**
 * Окна правки реквизита: основные поля (в том числе новый реквизит), адрес и
 * банк. Открыто то окно, чей черновик лежит в сторе, и вкладка экрана на это
 * не влияет: окна не принадлежат содержимому вкладки (Radix снимает с экрана
 * неактивную вкладку вместе с окном, а черновик остаётся в сторе).
 * Возвращает готовые пропсы окна или null, если черновика нет.
 */
export const useDraftModals = () => {
    const { domain, companyId } = useApp();
    const { resolved: clientType } = useClientType();
    const base = useBxRqEditBase();
    const address = useBxRqEditAddress();
    const bank = useBxRqEditBank();

    const baseDraft = base.creating;
    const addressDraft = address.creating;
    const bankDraft = bank.creating;

    return {
        base: baseDraft
            ? {
                  type: 'base' as const,
                  isOpen: true,
                  title:
                      baseDraft.bx_id > 0
                          ? 'Редактирование основной информации'
                          : 'Новый реквизит',
                  fields: baseDraft.fields,
                  isLoading: base.isCreatingLoading,
                  onSave: () => void base.saveBase(domain, companyId, clientType),
                  onCancel: base.cancelBaseCreating,
                  onFieldChange: base.setBaseProp,
                  onFieldBlur: base.blurCase,
                  isSimpleBankCommentMode: base.isSimpleBankCommentMode,
                  simpleBankCommentValue: base.simpleBankComment,
                  onSimpleBankCommentChange: base.setSimpleBankComment,
                  submitError: base.saveError,
              }
            : null,
        address: addressDraft
            ? {
                  type: 'address' as const,
                  isOpen: true,
                  title: `Редактирование: ${addressTitle(addressDraft.type_id)}`,
                  fields: addressDraft.fields,
                  isLoading: address.isCreatingLoading,
                  onSave: () =>
                      void address.saveAddress(
                          domain,
                          companyId,
                          clientType,
                          addressDraft.type_id,
                      ),
                  onCancel: address.cancelAddressCreating,
                  onFieldChange: address.setAddressProp,
              }
            : null,
        bank: bankDraft
            ? {
                  type: 'bank' as const,
                  isOpen: true,
                  title: 'Редактирование банковских реквизитов',
                  fields: bankDraft.fields,
                  isLoading: bank.isCreatingLoading,
                  onSave: () => void bank.saveBank(domain, companyId, clientType),
                  onCancel: bank.cancelBankCreating,
                  onFieldChange: bank.setBankProp,
              }
            : null,
    };
};
