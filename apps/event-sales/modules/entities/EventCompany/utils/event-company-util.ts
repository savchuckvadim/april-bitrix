export type CompanyColorType = 'red' | 'green' | 'yellow';

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
