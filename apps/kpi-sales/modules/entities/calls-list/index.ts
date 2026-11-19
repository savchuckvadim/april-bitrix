// Раздел «Разборы звонков»: контракт ручки списка, фильтры в адресе страницы,
// вид строк. Страница — widgets/calls-list.
export * from './model/types';
export * from './model/calls-list.selectors';
export * from './lib/calls-list.const';
export * from './lib/calls-list.texts';
export * from './lib/calls-list-period';
export * from './lib/calls-list-query';
export * from './lib/calls-list-format';
export * from './lib/calls-list-error';
export { fetchCallsList } from './lib/api/calls-list-api';
