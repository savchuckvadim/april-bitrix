// Наружу — только то, что действительно потребляют другие слои: стор,
// отправка отчёта (сброс/ошибки прогноза) и две шапки. Всё остальное
// (thunk'и, шкала прогноза, справочник значений) живёт внутри слайса.
export {
    EV_COMPANY_PROP,
    eventCompanyActions,
    eventCompanyReducer,
} from './model/EventCompanySlice';
export { ClientBar } from './ui/ClientBar';
export { ProspectScale } from './ui/ProspectScale';
