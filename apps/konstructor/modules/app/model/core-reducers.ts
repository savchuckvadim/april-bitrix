import { catalogReducer } from '@/modules/entities/catalog';
import { complectDescriptionReducer } from '@/modules/entities/complect-description';
import { rowSetReducer } from '@/modules/entities/row-set';
import { compositionViewReducer } from '@/modules/features/composition-editor/model/CompositionViewSlice';

/**
 * Ядро сборки комплекта: каталог, строки, вид наполнения, описание. Общее для
 * стора фрейма и стора публичной версии, поэтому здесь нет ничего про сделку,
 * портал и Битрикс (проверяет modules/public-app/__tests__/no-bitrix.test.ts).
 */
export const coreReducers = {
    catalog: catalogReducer,
    rowSet: rowSetReducer,
    compositionView: compositionViewReducer,
    complectDescription: complectDescriptionReducer,
};
