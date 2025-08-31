import {
    IOfferTemplateColors,
    IOfferTemplateFont,
} from '@/modules/entities/offer-template/type/offer-template.type';
import { IOfferTemplate } from '@/modules/entities/offer-template/type/offer-template.type';

export const titlePositions = [
    {
        id: 0,
        name: 'Слева сверху',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        isActive: true,
        style: 'text' as 'text' | 'border' | 'background',
    },
    {
        id: 1,
        name: 'Слева снизу',
        left: 1,
        top: 0,
        right: 0,
        bottom: 1,
        isActive: true,
        style: 'text' as 'text' | 'border' | 'background',
    },
    {
        id: 2,
        name: 'Справа сверху',
        left: 0,
        top: 1,
        right: 1,
        bottom: 0,
        isActive: true,
        style: 'text' as 'text' | 'border' | 'background',
    },
    {
        id: 3,
        name: 'Справа снизу',
        left: 0,
        top: 0,
        right: 1,
        bottom: 1,
        isActive: true,
        style: 'text' as 'text' | 'border' | 'background',
    },
    {
        id: 4,
        name: 'По центру',
        left: '50%',
        top: '50%',
        isActive: true,
        style: 'text' as 'text' | 'border' | 'background',
    },
];

export const colors = {
    // base: {
    //     code: 'base',
    //     value: '#000000',
    //     name: 'Фирменный цвет'
    // },
    text: {
        code: 'text',
        value: '#000000',
        name: 'Текст',
    },
    background: {
        code: 'background',
        value: '#ffffff',
        name: 'Фон',
    },
    // border: {
    //     code: 'border',
    //     value: '#000000',
    //     name: 'Граница'
    // },
    accent: {
        code: 'accent',
        value: '#3d3af6',
        name: 'Заголовки',
    },
    accentText: {
        code: 'accentText',
        value: '#ff0000',
        name: 'Акцентный текст',
    },
} as IOfferTemplateColors;

export const defaultTemplate: IOfferTemplate = {
    id: '0',
    name: 'Новый шаблон',
    description: 'Новый шаблон',
    // style: {},
    font: {
        id: 20,
        label: 'Geist',
        value: 'Geist, serif',
    } as IOfferTemplateFont,
    pages: [],
    colors: colors,
};
