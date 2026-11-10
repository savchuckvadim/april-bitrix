// Поверхность app-слоя для нижних слоёв: хуки стора и типы. Значения стора,
// App-гейт и Битрикс-инициализация импортируются по прямому пути: через этот
// баррель они попали бы в публичную версию (modules/public-app).
export type * from './model/store';
export * from './lib/hooks/redux';
export * from './lib/hooks/is-client-mounted.hook';
export * from './lib/hooks/use-small-display';
