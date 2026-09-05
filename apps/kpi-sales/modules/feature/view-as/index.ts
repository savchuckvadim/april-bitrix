// Режим «Смотреть как…» (superuser): просмотр отчёта глазами сотрудника
// без риска перезаписать его состояние (гарды в ui-settings/saveFilter).
export { ViewAsControl } from './ui/ViewAsControl';
export { ViewAsBanner } from './ui/ViewAsBanner';
export { activateViewAs, deactivateViewAs } from './model/view-as-thunks';
export { visibilityLabel } from '@/modules/entities/department';
