import { FileSignature, FileText, PackageCheck } from 'lucide-react';
import type { ComponentType } from 'react';
import { KONSTRUCTOR_ROUTE_PATH, ROUTE_KONSTRUCTOR } from './routes';

export type DocumentKind = 'offer' | 'contract' | 'supply-report';

export interface DocumentKindInfo {
    kind: DocumentKind;
    title: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    /** Что было на экране в легаси — план переноса, пока экрана нет. */
    legacyScope: string[];
}

/** Виды документов сделки (легаси `document.select.templateType`). */
export const DOCUMENT_KINDS: DocumentKindInfo[] = [
    {
        kind: 'offer',
        title: 'Коммерческое предложение',
        description: 'КП по шаблону: инфоблоки, цены, сравнение комплектов.',
        icon: FileText,
        legacyScope: [
            'выбор шаблона Word и поставщика',
            'получатель, номер и дата письма',
            'настройки представления цен и инфоблоков',
            'счёт к КП, «3 КП для торгов»',
        ],
    },
    {
        kind: 'contract',
        title: 'Договор',
        description: 'Договор и спецификация по выбранному комплекту.',
        icon: FileSignature,
        legacyScope: [
            'номер договора, тип клиента, поставщик',
            'поля Битрикса: даты, контакты клиента',
            'реквизиты клиента',
            'спецификация и цены',
        ],
    },
    {
        kind: 'supply-report',
        title: 'Отчёт о поставке',
        description: 'Отчёт и запуск процесса поставки.',
        icon: PackageCheck,
        legacyScope: [
            'карточка поставки и поля Битрикса',
            'реквизиты и контакт клиента',
            'спецификация и цены',
            'запуск процесса поставки (RPA)',
        ],
    },
];

export const isDocumentKind = (value: string): value is DocumentKind =>
    DOCUMENT_KINDS.some(info => info.kind === value);

export const findDocumentKind = (kind: DocumentKind): DocumentKindInfo =>
    DOCUMENT_KINDS.find(info => info.kind === kind) ?? DOCUMENT_KINDS[0]!;

export const documentPath = (kind: DocumentKind): string =>
    `${KONSTRUCTOR_ROUTE_PATH[ROUTE_KONSTRUCTOR.DOCUMENT]}/${kind}`;
