/**
 * PortalFlowSource — браузерная реализация порта FlowPortalSource поверх
 * слепка портала из Redux (`state.portal.portal`, тип Portal из
 * @workspace/pbx) + домена приложения.
 *
 * Девять lookup-методов — тела 1:1 с бэковым PortalModel
 * (back/libs/portal-lib/portal/src/services/portal.model.ts), сверены
 * построчно; в частности:
 *  - getFieldBitrixId НЕ удваивает префикс UF_CRM_ (konstructor-строки
 *    слепка хранят полное имя) — поэтому НЕ `ufKey` из @workspace/pbx:
 *    тот наклеивает префикс безусловно;
 *  - getTimezone — та же карта доменов (shared/lib/timezone, зеркало
 *    back/libs/shared/src/lib/date/timezone.ts): незнакомый домен →
 *    Europe/Moscow;
 *  - getSalesTaskGroupId — бэковый фолбэк 41 при неустановленной группе.
 *
 * Слепок браузера отличается от бэкового IPortal формой (bitrixDeal вместо
 * deals[], только bitrixLists, домен живёт в app-стейте) — конструктор
 * приводит его к IPortal-виду ОДИН раз, дальше тела методов читают
 * `this.portal.*` дословно как на бэке. Единственная сознательная
 * поблажка: отсутствующая секция сделок деградирует в пустые массивы
 * (getDealCategories → []), а не в TypeError бэка — битый слепок в браузере
 * не должен ронять весь флоу.
 */
import type { Portal } from '@workspace/pbx';
import { resolveTimezoneByDomain } from '../../shared/lib/timezone';
import { ETimeZone } from '../../shared/utils/date-convert.util';
import type {
    FlowPortalSource,
    IField,
    IFieldItem,
    IPBXList,
    IPCategory,
    IPortal,
    PBXListCode,
    PbxEntityType,
} from '../../ports/flow-portal.port';

/**
 * Терпимый структурный вход: ровно те поля слепка, которые читают девять
 * методов, всё опционально — живой слепок бывает частичным (например, до
 * install'а списков). Тип Portal из @workspace/pbx ложится сюда структурно
 * (см. компайл-свидетеля ниже).
 */
export interface BrowserPortalSnapshot {
    bitrixDeal?: { bitrixfields?: IField[]; categories?: IPCategory[] } | null;
    company?: { bitrixfields?: IField[] } | null;
    contact?: { bitrixfields?: IField[] } | null;
    lead?: { bitrixfields?: IField[]; categories?: IPCategory[] } | null;
    bitrixLists?: IPBXList[] | null;
    bitrixCallingTasksGroup?: { bitrixId: number } | null;
}

// Компайл-свидетель: слепок @workspace/pbx подходит без кастов. Ломается
// сборкой, если pbx-типы разъедутся с портовыми подмножествами.
const acceptsPbxPortal = (portal: Portal): BrowserPortalSnapshot => portal;
void acceptsPbxPortal;

/** IPortal-вид браузерного слепка: та же карта чтения, что у бэковой модели. */
const toPortalView = (
    snapshot: BrowserPortalSnapshot,
    domain: string,
): IPortal => ({
    domain,
    // `deals` — массив по историческим причинам портальной модели: рабочая
    // запись всегда deals[0]; в браузере это bitrixDeal слепка.
    deals: [
        {
            bitrixfields: snapshot.bitrixDeal?.bitrixfields ?? [],
            categories: snapshot.bitrixDeal?.categories ?? [],
        },
    ],
    company: snapshot.company
        ? { bitrixfields: snapshot.company.bitrixfields ?? [] }
        : undefined,
    contact: snapshot.contact
        ? { bitrixfields: snapshot.contact.bitrixfields ?? [] }
        : undefined,
    lead: snapshot.lead
        ? {
              bitrixfields: snapshot.lead.bitrixfields ?? [],
              categories: snapshot.lead.categories ?? undefined,
          }
        : undefined,
    // Браузерный слепок ведёт только bitrixLists; lists не бывает — бэковый
    // порядок поиска (сначала lists, затем bitrixLists) сохранён телом метода.
    lists: undefined,
    bitrixLists: snapshot.bitrixLists ?? undefined,
    bitrixCallingTasksGroup: snapshot.bitrixCallingTasksGroup ?? undefined,
});

export class PortalFlowSource implements FlowPortalSource {
    private readonly portal: IPortal;

    constructor(snapshot: BrowserPortalSnapshot, domain: string) {
        this.portal = toPortalView(snapshot, domain);
    }

    getPortal(): IPortal {
        return this.portal;
    }

    /**
     * IANA-таймзона клиентского портала. Определяется по domain
     * (см. resolveTimezoneByDomain). Дефолт — Europe/Moscow.
     */
    getTimezone(): ETimeZone {
        return resolveTimezoneByDomain(this.portal.domain);
    }

    getListByCode(code: PBXListCode): IPBXList | undefined {
        let result = this.portal.lists?.find(
            list => `${list.group}_${list.type}` === code,
        );
        if (!result) {
            result = this.portal.bitrixLists?.find(
                list => `${list.group}_${list.type}` === code,
            );
        }
        return result;
    }

    getEntityFieldByCode(
        entityType: PbxEntityType,
        code: string,
    ): IField | undefined {
        if (entityType === 'company') {
            return this.portal.company?.bitrixfields.find(
                field => field.code === code,
            );
        }
        if (entityType === 'lead') {
            return this.portal.lead?.bitrixfields.find(
                field => field.code === code,
            );
        }
        if (entityType === 'deal') {
            return this.portal.deals?.[0]?.bitrixfields.find(
                field => field.code === code,
            );
        }
        if (entityType === 'contact') {
            return this.portal.contact?.bitrixfields.find(
                field => field.code === code,
            );
        }
        return undefined;
    }

    // `deals[0]?` — та же сознательная поблажка битому слепку, что в шапке:
    // toPortalView всегда кладёт deals[0], опциональная цепочка нужна только
    // строгому noUncheckedIndexedAccess потребителей (apps/*).
    getDealCategories(): IPCategory[] {
        return this.portal.deals[0]?.categories ?? [];
    }

    getDealCategoryByCode(code: string): IPCategory | undefined {
        return this.portal.deals[0]?.categories.find(
            category => category.code === code,
        );
    }

    /**
     * Полное имя UF_CRM-поля. `bitrixId` в слепке неоднороден:
     * konstructor-строки хранят полное имя («UF_CRM_1684144993»), остальные —
     * суффикс («CONTRACT_TYPE», «1687967605») — не наклеиваем префикс дважды.
     */
    getFieldBitrixId(field: IField): string {
        const raw = String(field.bitrixId ?? '');
        return raw.startsWith('UF_CRM_') ? raw : `UF_CRM_${raw}`;
    }

    getFieldItemByCode(
        field: IField,
        itemCode: string,
    ): IFieldItem | undefined {
        return field.items.find(item => item.code === itemCode);
    }

    /**
     * Id рабочей группы задач отдела продаж; фолбэк бэка — 41 (группа
     * ставится каноном pbx-install и может отсутствовать в слепке).
     */
    getSalesTaskGroupId = (): number => {
        let result = 41;
        if (this.portal) {
            if (this.portal.bitrixCallingTasksGroup) {
                result = this.portal.bitrixCallingTasksGroup.bitrixId;
            }
        }
        return result;
    };
}
