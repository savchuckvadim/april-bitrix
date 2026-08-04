export type CompanyColorType = 'red' | 'green' | 'yellow';

/**
 * Шкала прогноза: три ступени от худшей к лучшей.
 *
 * Порядок здесь — сам смысл шкалы, поэтому массив, а не карта. Классы тонов
 * прописаны явно: `red/yellow/green` — коды портального поля, и выводить из
 * них цвет строкой значило бы завязать вёрстку на данные портала.
 */
export const PROSPECT_SCALE: ReadonlyArray<{
    code: CompanyColorType;
    name: string;
    activeClass: string;
}> = [
    { code: 'red', name: 'Красный', activeClass: 'bg-destructive' },
    { code: 'yellow', name: 'Жёлтый', activeClass: 'bg-warning' },
    { code: 'green', name: 'Зелёный', activeClass: 'bg-success' },
];

type ColorResult = {
    btnColor: 'success' | 'warning' | 'danger';
    value: number;
    nextColor: CompanyColorType;
};

/** Цикл цвета компании (прогноз): red → yellow → green → red. */
export const getByColor = (color: CompanyColorType): ColorResult => {
    const result: ColorResult = {
        btnColor: 'danger',
        value: 0,
        nextColor: 'red',
    };

    if (color == 'red') {
        result.btnColor = 'danger';
        result.value = 35;
        result.nextColor = 'yellow';
    } else if (color == 'yellow') {
        result.btnColor = 'warning';
        result.value = 68;
        result.nextColor = 'green';
    } else if (color == 'green') {
        result.btnColor = 'success';
        result.value = 99;
        result.nextColor = 'red';
    }

    return result;
};
