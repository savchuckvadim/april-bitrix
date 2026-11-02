/** Публичная поверхность раздела «Методики продаж». */
export { MethodologiesPage } from './ui/MethodologiesPage/MethodologiesPage';
export type { EditorSelection } from './lib/methodology-form.state';
export {
    useMethodologies,
    useMethodologyCatalog,
    useMethodologyDetail,
} from './lib/hooks/use-methodologies';
export { METHODOLOGIES_PATH } from './model';
export type {
    MethodologyCatalog,
    MethodologyConfig,
    MethodologyDetail,
    MethodologyItem,
} from './model';
