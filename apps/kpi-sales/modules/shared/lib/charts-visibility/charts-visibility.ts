/**
 * Графики видны, только когда портал их разрешил (настройка «Показывать
 * графики») и экран не телефон: на телефоне графиков нет никогда.
 */
export const chartsVisible = (settingEnabled: boolean, isMobile: boolean): boolean =>
    settingEnabled && !isMobile;

/**
 * Вид блока с переключателем «график / таблица»: когда графики скрыты, блок
 * всегда показывает табличный вид (сам переключатель при этом прячут).
 */
export const effectiveChartView = <View extends string>(
    view: View,
    tableView: View,
    visible: boolean,
): View => (visible ? view : tableView);
