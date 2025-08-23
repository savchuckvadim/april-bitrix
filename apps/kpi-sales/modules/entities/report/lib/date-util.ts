import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parse,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  IFilterResponse,
  EReportDateMode,
  ReportDateType,
  ReportDate,
} from "../model/types/report/report-type";
import { AppDispatch } from "@/modules/app/model/store";
import { reportActions } from "../model";

export const getDatesByMode = (
  mode: EReportDateMode,
): {
  from: string;
  to: string;
} => {
  const today = new Date();
  let from: Date = startOfWeek(today, { weekStartsOn: 1 });
  let to: Date = endOfWeek(today, { weekStartsOn: 1 });

  switch (mode) {
    case EReportDateMode.TODAY:
      from = today;
      to = today;
      break;
    case EReportDateMode.WEEK:
      from = startOfWeek(today, { weekStartsOn: 1 });
      to = endOfWeek(today, { weekStartsOn: 1 });
      break;
    case EReportDateMode.MONTH:
      from = startOfMonth(today);
      to = endOfMonth(today);
      break;
  }
  const fromFormated = format(from, "yyyy-MM-dd") as string;
  const toFormatted = format(to, "yyyy-MM-dd") as string;

  return {
    from: fromFormated,
    to: toFormatted,
  };
};
export const getDatesByRememberFilter = (
  filter: IFilterResponse,
): {
  from: string;
  to: string;
  isMode: boolean;
} => {
  if (!filter.dates) {
    return {
      from: "",
      to: "",
      isMode: false,
    };
  }
  const comeFrom = filter.dates?.[ReportDateType.FROM];
  const comeTo = filter.dates?.[ReportDateType.TO];
  const targetModes = [
    EReportDateMode.TODAY,
    EReportDateMode.WEEK,
    EReportDateMode.MONTH,
  ];
  const isMode =
    targetModes.includes(comeFrom as EReportDateMode) ||
    targetModes.includes(comeTo as EReportDateMode);

  const result = {
    from: comeFrom,
    to: comeTo,
    isMode: isMode,
  };
  if (isMode) {
    const { from, to } = getDatesByMode(comeFrom as EReportDateMode);
    result.from = from;
    result.to = to;
  }
  return result;
};

export const modifyDateToReportRequest = (
  from: string,
  to: string,
): {
  from: string;
  to: string;
} => {
  const parseDateFrom = parseISO(from);
  const parseDateTo = parseISO(to);
  const dateFrom = format(parseDateFrom, "dd.MM.yyyy");
  const modifiedDateTo = addDays(parseDateTo, 1);
  const dateTo = format(modifiedDateTo, "dd.MM.yyyy");

  return {
    from: dateFrom,
    to: dateTo,
  };
};

export const reportDateRequestFlow = (
  dispatch: AppDispatch,
  isFirstLoad: boolean,
  savedFilterData: IFilterResponse | null,
  stateReportDate: ReportDate,
): {
  from: string;
  to: string;
} => {
  let date = { ...stateReportDate };
  if (isFirstLoad && savedFilterData && savedFilterData.dates) {
    const { isMode, from, to } = getDatesByRememberFilter(savedFilterData);

    if (isMode) {
      dispatch(
        reportActions.setChangedDateMode({
          mode: savedFilterData.dates[ReportDateType.FROM] as EReportDateMode,
        }),
      );
    } else {
      dispatch(
        reportActions.setChangedDate({
          typeOfDate: ReportDateType.FROM,
          value: savedFilterData.dates[ReportDateType.FROM],
        }),
      );
      dispatch(
        reportActions.setChangedDate({
          typeOfDate: ReportDateType.TO,
          value: savedFilterData.dates[ReportDateType.TO],
        }),
      );
    }

    if (isFirstLoad && savedFilterData && savedFilterData.dates) {
      if (isMode) {
        date[ReportDateType.FROM] = from;
        date[ReportDateType.TO] = to;
      } else {
        date[ReportDateType.FROM] = normalizeToISO(
          savedFilterData.dates[ReportDateType.FROM],
        ) as string;
        date[ReportDateType.TO] = normalizeToISO(
          savedFilterData.dates[ReportDateType.TO],
        ) as string;
      }
    }
  }
  return modifyDateToReportRequest(
    date[ReportDateType.FROM],
    date[ReportDateType.TO],
  );
};

export const normalizeToISO = (date: string): string => {
  let parsed = parseISO(date);

  if (!isValid(parsed)) {
    parsed = parse(date, "dd.MM.yyyy", new Date());
  }

  return isValid(parsed) ? format(parsed, "yyyy-MM-dd") : "";
};
