import { format } from 'date-fns';
import { FilterInnerCode } from '../model/types/report/report-type';
import { ru } from 'date-fns/locale';

export const getChartColorsArray = (colors: string) => {
    const parsedColors = JSON.parse(colors);
    return Array.isArray(parsedColors) ? parsedColors.map((value: string) => {
        const newValue = value.replace(" ", "");
        if (newValue.indexOf(",") === -1) {
            const color = getComputedStyle(document.documentElement).getPropertyValue(newValue);
            if (color.indexOf("#") !== -1) return color.replace(" ", "");
            return color || newValue;
        } else {
            const val = value.split(',');
            if (val.length === 2) {
                const rgbaColor = (getComputedStyle(document.documentElement).getPropertyValue(val?.[0] || '') || '') as string;
                return `rgba(${rgbaColor},${val[1]})`;
            }
            return newValue;
        }
    }) : [];
};

export const getColors = (report: any[] | undefined) => {
    const reportColors: Record<FilterInnerCode, string> = {
        result_communication_plan: "rgba(160, 200, 220, 0.81)",
        result_communication_done: "rgba(120, 180, 220, 0.76)",
        call_plan: "rgba(135, 206, 250, 1)",
        call_done: "rgba(30, 144, 255, 1)",
        call_expired: "rgba(200, 200, 200, 1)",
        call_pound: "rgba(180, 180, 180, 1)",
        call_act_noresult_fail: "rgba(160, 160, 160, 1)",
        presentation_plan: "rgba(255, 215, 0, 1)",
        presentation_done: "rgba(255, 140, 0, 1)",
        presentation_expired: "rgba(255, 200, 0, 1)",
        presentation_pound: "rgba(255, 180, 0, 1)",
        presentation_act_noresult_fail: "rgba(255, 160, 0, 1)",
        presentation_uniq_plan: "rgba(202, 176, 255, 1)",
        presentation_contact_uniq_plan: "rgb(255, 66, 163)",
        presentation_contact_uniq_done: "rgb(255, 0, 140)",
        presentation_uniq_done: "rgba(166, 110, 200, 1)",
        presentation_uniq_expired: "rgba(180, 140, 220, 1)",
        presentation_uniq_pound: "rgba(160, 120, 200, 1)",
        presentation_uniq_act_noresult_fail: "rgba(140, 100, 180, 1)",
        ev_offer_act_send: "rgba(106, 180, 242, 1)",
        ev_offer_pres_act_send: "rgba(48, 224, 226, 1)",
        ev_invoice_act_send: "rgba(30, 178, 178, 1)",
        ev_invoice_pres_act_send: "rgba(68, 213, 144, 1)",
        ev_contract_act_send: "rgba(35, 186, 35, 1)",
        ev_success_done: "rgba(35, 186, 35, 1)",
        ev_fail_done: "rgba(255, 96, 85, 1)"
    } as const;

    if (report && report.length) {
        const resultColors: string[] = [];
        for (const code in reportColors) {
            report.forEach(repor => {
                if (repor && repor.action && repor.action.innerCode === code) {
                    resultColors.push(reportColors[code as FilterInnerCode]);
                }
            });
        }

        return resultColors;
    }

    return Object.values(reportColors);
};

export const formatPeriod = (from: string, to: string) => {
    const fromDate = new Date(from)
    const toDate = new Date(to)

    return `${format(fromDate, 'd MMMM yyyy', { locale: ru })} – ${format(toDate, 'd MMMM yyyy', { locale: ru })}`
}