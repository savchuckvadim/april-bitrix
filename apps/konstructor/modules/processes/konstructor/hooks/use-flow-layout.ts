'use client';

import { useAppSelector } from '@/modules/app';
import {
    getComplectAttr,
    getComplectStyleOverride,
    selectCatalog,
} from '@/modules/entities/catalog';
import { selectMainRow } from '@/modules/entities/row-set';

/**
 * Цвет текущего комплекта для всей рамки шагов (легаси `complect--active`):
 * data-complect на корне — токен --complect-current наследуют степпер,
 * плитки и кнопки; цвет из админки побеждает токен инлайн-переменной.
 */
export const useFlowLayout = () => {
    const catalog = useAppSelector(selectCatalog);
    const complectCode = useAppSelector(selectMainRow)?.refs.complectCode;
    const complect = complectCode ? catalog.complects.byCode[complectCode] : null;

    return {
        complectAttr: getComplectAttr(complectCode),
        complectStyle: getComplectStyleOverride(complect),
    };
};
