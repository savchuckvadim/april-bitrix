'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getIsLeadContext } from '@/modules/app/lib/utills/app-state-util';
import { EV_COMPANY_PROP } from '@/modules/entities/EventCompany';

/**
 * Идентификатор действия при предупреждении. Хук не знает, ЧТО произойдёт —
 * только что действие возможно; обработчики живут в шапке. Новый экшен
 * добавляется одной строкой здесь и одной в ITEM_WARNING_HANDLERS.
 */
export type ItemWarningActionId =
    | 'fill-inn'
    | 'fill-company-title'
    | 'check-duplicates-inn'
    | 'check-duplicates-contacts';

export interface ItemWarning {
    id: string;
    text: string;
    /** true — блокирует презентацию; такие показываем первыми. */
    blocking: boolean;
    action?: { id: ItemWarningActionId; label: string };
}

/**
 * Предупреждения для шапки: чего не хватает, чтобы работать с клиентом
 * дальше. Собираются в одном месте — компонент только рисует список.
 *
 * Правило: предупреждение появляется, только когда мы ТОЧНО знаем, что
 * данных нет. Если поле не приходит с портала вовсе — молчим, иначе
 * менеджер увидит вечное предупреждение, которое нечем закрыть.
 */
export const useItemWarnings = (): ItemWarning[] => {
    const company = useAppSelector(s => s.app.bitrix.company);
    const isLeadContext = useAppSelector(getIsLeadContext);
    const colorRequired = useAppSelector(s => s.app.config.withColorRequired);
    const color = useAppSelector(s => s.company[EV_COMPANY_PROP.COLOR]);

    const warnings: ItemWarning[] = [];

    if (isLeadContext) {
        warnings.push({
            id: 'lead-not-converted',
            text: 'Это лид. Перед презентацией сконвертируйте его в компанию.',
            blocking: true,
        });
    }

    // Название компании: в лиде компании ещё нет — там об этом говорит
    // предупреждение выше, дублировать не нужно.
    if (!isLeadContext && company && !company.TITLE?.trim()) {
        warnings.push({
            id: 'company-title',
            text: 'У компании не заполнено название.',
            blocking: true,
            action: { id: 'fill-company-title', label: 'Заполнить' },
        });
    }

    // TODO(бэк): ИНН. В BXCompany сейчас только ID / TITLE / PRES_COUNT —
    // ИНН с портала не приходит, поэтому проверку включить нечем. Когда поле
    // появится:
    //   if (!isLeadContext && company && !company.INN) push({
    //       id: 'company-inn', blocking: false,   // в моменте не обязателен,
    //       text: 'У компании не заполнен ИНН.',  // но нужен в долгосроке
    //       action: { id: 'fill-inn', label: 'Заполнить' },
    //   });
    // Поиск дублей по ИНН доступен, только когда известны И компания, И ИНН;
    // поиск по контактам — независимо от него.

    // Про прогноз предупреждения нет намеренно: шкала теперь стоит тут же, в
    // шапке, и сама показывает и «не задан», и ошибку после неудачной отправки.
    // Строка предупреждения рядом с самим контролом была бы вторым голосом об
    // одном и том же.
    void colorRequired;
    void color;

    return warnings.sort((a, b) => Number(b.blocking) - Number(a.blocking));
};
