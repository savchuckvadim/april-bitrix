// Отзыв руководителя о разборе звонка: контракт ручек личной страницы,
// черновик отзыва (чистый редьюсер), тексты и вид. Вёрстка — widgets/call-page.
export * from './model/types';
export * from './lib/call-review.const';
export * from './lib/call-review.texts';
export * from './lib/call-review-draft';
export * from './lib/call-review-error';
export * from './lib/call-review-guard';
export * from './lib/call-review-format';
export { callReviewSaveResultOf, saveCallReview } from './lib/api/call-review-api';
