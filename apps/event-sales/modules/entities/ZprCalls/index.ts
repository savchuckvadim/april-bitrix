/**
 * ЗПР («Звонки По решению») — элементы смарт-процесса клиента: ссылки
 * op_zprs → элементы crm.item → лестница стадий с живыми цветами.
 *
 * Публичная поверхность узкая: карточка/панель сами берут данные хуками;
 * наружу — компоненты, WS-контракт, ключи react-query (для инвалидации из
 * листенеров) и доменные типы.
 */
export * from './model';
export {
    ZPR_FLOW_DONE_EVENT,
    type ZprFlowAction,
    type ZprFlowDonePayload,
} from './lib/zpr-flow-event';
export {
    ZPR_QUERY_ROOT,
    ZPR_STAGES_QUERY_ROOT,
} from './lib/hooks/zpr-query-keys';
export { ZprCallsCard, ZprCallsPanel, ZprStageBar } from './ui';
