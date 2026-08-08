'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    getClientContext,
    getIsLeadContext,
} from '@/modules/app/lib/utills/app-state-util';
import { EV_COMPANY_PROP } from '@/modules/entities/EventCompany';
import { getCurrentInn, getInnTarget } from '@/modules/features/Inn';

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
    const context = useAppSelector(getClientContext);
    const colorRequired = useAppSelector(s => s.app.config.withColorRequired);
    const color = useAppSelector(s => s.company[EV_COMPANY_PROP.COLOR]);
    const innTarget = useAppSelector(getInnTarget);
    const inn = useAppSelector(getCurrentInn);

    const warnings: ItemWarning[] = [];

    if (isLeadContext) {
        warnings.push({
            id: 'lead-not-converted',
            text: 'Это лид. Перед презентацией сконвертируйте его в компанию.',
            blocking: true,
        });
    }

    // Сделка без компании: раньше тут была полная тишина — единственный
    // кейс, о котором шапка не говорила вовсе. Не блокирует (звонок,
    // презентация и решение разрешены), но требует внимания.
    if (context === 'dealNoCompany') {
        warnings.push({
            id: 'no-company',
            text: 'У сделки не привязана компания.',
            blocking: false,
            action: { id: 'check-duplicates-inn', label: 'Найти по ИНН' },
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

    // ИНН: значение читается из полной сущности по pbx-полю op_inn
    // (features/Inn). innTarget null — поля нет на портале, молчим (§5).
    if (innTarget && !inn) {
        if (company) {
            warnings.push({
                id: 'company-inn',
                text: 'У компании не заполнен ИНН.',
                blocking: false,
                action: { id: 'fill-inn', label: 'Заполнить' },
            });
        } else if (context === 'dealNoCompany') {
            warnings.push({
                id: 'deal-inn',
                text: 'Запишите ИНН — поможет найти компанию и дубли.',
                blocking: false,
                action: { id: 'fill-inn', label: 'Записать' },
            });
        }
    }

    // Про прогноз предупреждения нет намеренно: шкала теперь стоит тут же, в
    // шапке, и сама показывает и «не задан», и ошибку после неудачной отправки.
    // Строка предупреждения рядом с самим контролом была бы вторым голосом об
    // одном и том же.
    void colorRequired;
    void color;

    return warnings.sort((a, b) => Number(b.blocking) - Number(a.blocking));
};
