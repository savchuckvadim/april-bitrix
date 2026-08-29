import { PresentationProp, type PresentationState } from '../model/PresSlice';

/**
 * «Презентация проведена» — ОДНО определение факта на весь фрейм.
 *
 * Флага два, и это не дубль: `isPresentationDone` ставится сама при отчёте
 * по презентационному событию, `isUnplannedPresentation` — кнопкой на
 * непрезентационном («провели спонтанно»). Для всего, что дальше — payload
 * отчёта, условие показа анкеты, — важен один факт: презентация была.
 *
 * Выражение вынесено сюда потому, что читателей у него уже двое (сборка
 * payload и условие `presentationDone` каталога анкет), а разъехавшись, они
 * дали бы худшую из ошибок: бэк создаёт элемент презентации, а анкета к
 * нему не показана — ответы собрать негде и объяснить это нечем.
 */
export const isPresentationDone = (state: PresentationState): boolean =>
    state[PresentationProp.IS_PRESENTATION_DONE] ||
    state[PresentationProp.IS_UNPLANNED_PRESENTATION];
