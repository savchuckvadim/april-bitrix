import { DEFAULT_COMPLECT_COMPOSITION, type ComplectComposition } from '../model/dto';

/**
 * Настройки сборки после правки: значения по умолчанию, текущие настройки и
 * правка поверх, блок КП сливается по полям. «Показать в КП наборы для
 * сравнения» с экрана убрана: сравнивать варианты в одном КП не нужно, поэтому
 * при каждом сохранении настроек `offer.showAlternatives` пишется `false`.
 */
export const mergeComposition = (
    current: ComplectComposition,
    patch: Partial<ComplectComposition>,
): ComplectComposition => ({
    ...DEFAULT_COMPLECT_COMPOSITION,
    ...current,
    ...patch,
    offer: { ...current.offer, ...(patch.offer ?? {}), showAlternatives: false },
});
