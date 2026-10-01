// Публичная поверхность слайса — только то, что потребляется снаружи:
// reducer в store. Панель монтируют через next/dynamic по прямому пути.
export { clientWorkReducer } from './model/ClientWorkSlice';
