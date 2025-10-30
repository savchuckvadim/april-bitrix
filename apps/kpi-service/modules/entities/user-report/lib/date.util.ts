import { parseISO, format } from "date-fns";

export const getUserReportDate = (from: string, to: string) => {
    const dateFrom = parseISO(from);
    const dateTo = parseISO(to);
    const result = {
        dateFrom: format(dateFrom, "dd.MM.yyyy"),
        dateTo: format(dateTo, "dd.MM.yyyy"),
    };
    return result;
}
