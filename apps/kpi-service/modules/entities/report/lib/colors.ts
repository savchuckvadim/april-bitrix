import { format } from 'date-fns';

import { ru } from 'date-fns/locale';
import { KPIOrk } from '@workspace/nest-api';
import { getColorByCode } from '../type/report-action.type';

export const getChartColorsArray = (colors: string) => {
    const parsedColors = JSON.parse(colors);
    return Array.isArray(parsedColors)
        ? parsedColors.map((value: string) => {
            const newValue = value.replace(' ', '');
            if (newValue.indexOf(',') === -1) {
                const color = getComputedStyle(
                    document.documentElement,
                ).getPropertyValue(newValue);
                if (color.indexOf('#') !== -1) return color.replace(' ', '');
                return color || newValue;
            } else {
                const val = value.split(',');
                if (val.length === 2) {
                    const rgbaColor = (getComputedStyle(
                        document.documentElement,
                    ).getPropertyValue(val?.[0] || '') || '') as string;
                    return `rgba(${rgbaColor},${val[1]})`;
                }
                return newValue;
            }
        })
        : [];
};

export const getColors = (kpi: KPIOrk[]): string[] => {
    //     const reportColors: Partial<Record<FilterInnerCode, string>> = {
    //         [`${FilterInnerCode.et_ork_signal_ea_ork_plan}`]: 'rgba(160, 200, 220, 0.81)',
    // //@ts-ignore
    //         et_ork_signal_ea_ork_act_create: 'rgba(120, 180, 220, 0.76)',
    //         [`${FilterInnerCode.et_ork_signal_ea_ork_done}`]: 'rgba(120, 180, 220, 0.76)',
    //         [`${FilterInnerCode.et_ork_signal_ea_ork_expired}`]: 'rgba(120, 180, 220, 0.76)',
    //         [`${FilterInnerCode.et_ork_signal_ea_ork_plan}`]: 'rgba(160, 200, 220, 0.81)',
    //         [`${FilterInnerCode.et_ork_signal_ea_ork_pound}`]: 'rgba(120, 180, 220, 0.76)',
    //         [`${FilterInnerCode.et_ork_signal_ea_ork_act_noresult_fail}`]: 'rgba(120, 180, 220, 0.76)',
    //         [`${FilterInnerCode.et_ork_call_collect_ea_ork_act_noresult_fail}`]: 'rgba(135, 206, 250, 1)',
    //         [`${FilterInnerCode.et_ork_call_collect_ea_ork_done}`]: 'rgba(30, 144, 255, 1)',
    //         [`${FilterInnerCode.et_ork_call_collect_ea_ork_expired}`]: 'rgba(200, 200, 200, 1)',
    //         [`${FilterInnerCode.et_ork_call_collect_ea_ork_pound}`]: 'rgba(180, 180, 180, 1)',

    //         [`${FilterInnerCode.et_ork_info_ea_ork_plan}`]: 'rgba(255, 215, 0, 1)',
    //         [`${FilterInnerCode.et_ork_info_ea_ork_done}`]: 'rgba(255, 140, 0, 1)',
    //         [`${FilterInnerCode.et_ork_info_ea_ork_expired}`]: 'rgba(255, 200, 0, 1)',
    //         [`${FilterInnerCode.et_ork_info_ea_ork_pound}`]: 'rgba(255, 180, 0, 1)',
    //         [`${FilterInnerCode.et_ork_info_ea_ork_act_noresult_fail}`]: 'rgba(255, 160, 0, 1)',
    //         [`${FilterInnerCode.et_ork_info_garant_ea_ork_plan}`]: 'rgba(202, 176, 255, 1)',
    //         [`${FilterInnerCode.et_ork_info_garant_ea_ork_done}`]: 'rgb(255, 66, 163)',
    //         [`${FilterInnerCode.et_ork_info_garant_ea_ork_expired}`]: 'rgb(255, 0, 140)',
    //         [`${FilterInnerCode.et_ork_info_garant_ea_ork_pound}`]: 'rgba(166, 110, 200, 1)',
    //         [`${FilterInnerCode.et_ork_info_garant_ea_ork_act_noresult_fail}`]: 'rgba(180, 140, 220, 1)',
    //     } as const;
    //
    //     if (report && report.length) {
    //         const resultColors: string[] = [];
    //         for (const code in reportColors) {
    //             report.forEach(repor => {
    //                 if (repor && repor.action && repor.action.innerCode === code) {
    //                     const color = reportColors[code as FilterInnerCode];
    //                     if (color) {
    //                         resultColors.push(color);
    //                     }
    //                 }
    //             });
    //         }

    //         return resultColors;
    //     }
    // return Object.values(reportColors);

    return kpi.map(kpi => getColorByCode(kpi.action.code));
};

export const formatPeriod = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    return `${format(fromDate, 'd MMMM yyyy', { locale: ru })} – ${format(toDate, 'd MMMM yyyy', { locale: ru })}`;
};
