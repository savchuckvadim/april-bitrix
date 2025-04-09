// import * as BX24 from 'bx24-api';
// import { addDays, addMonths, addWeeks, differenceInMonths, differenceInWeeks, format } from 'date-fns';

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// function parseDateFromString(dateString) {
//     const [day, month, year] = dateString.split('.');
//     return new Date(year, month - 1, day);
// }

// export const bitrixReportAPI = {

//     // initialBitrix: async () => {
//     //     bx24 = await window.BX24
//     //     return bx24
//     // },

//     getPlacement: async () => {
//         // if (testbx24) {
//         const plcmnt = await BX24.placement.info()

//         return plcmnt
//         // } else {
//         //     return null
//         // }


//     },


//     getListsItems: async (listId, departament, dateFieldForHookFrom, dateFieldForHookTo, dateFrom, dateTo) => {

//         const method = 'lists.element.get';
//         const IBLOCK_TYPE_ID = 'lists';
//         const IBLOCK_ID = 86;
//         let groupedItems = {}; // Объект для группировки элементов по отделам

//         for (const user of departament) {
//             // let start = 0; // Стартовая позиция для пагинации
//             // let items = []; // Массив для сбора всех элементов для текущего отдела

//             try {


//                 const params = {
//                     IBLOCK_TYPE_ID,
//                     IBLOCK_ID,
//                     filter: {
//                         '>PROPERTY_440': dateFrom,
//                         '<PROPERTY_440': dateTo,
//                         'PROPERTY_446': user.ID, // Фильтр по ID отдела
//                     },

//                 };
//                 const response = await BX24.callMethodAll(method, params);
//                 console.log(response)
//                 const data = response;
//                 if (data && data.answer && data.answer.result) {
//                     // items = items.concat(data.answer.result);
//                     console.log(data.answer);

//                 }

//                 // if (!data.answer.next) {
//                 //     break; // Выходим из цикла, если больше нет данных для загрузки
//                 // }
//                 // const nxt = data.answer.next
//                 // console.log(nxt)
//                 // start += Number(nxt); // Обновляем стартовую позицию
//                 // await sleep(100); // Задержка для снижения нагрузки на API


//                 // Добавляем собранные элементы в объект groupedItems, группируя по ID отдела
//                 groupedItems[user.ID] = response;
//             } catch (error) {
//                 console.error(`Ошибка при получении элементов списка для отдела ${user.ID}:`, error);
//             }
//         }

//         return groupedItems;
//     },
//     getVoximplantItems: async () => {

//         try {

//             const info = await bitrixAPI.getPlacement()
//             const companyId = info.options.ID;
//             return Number(companyId)

//         } catch (error) {

//             return null
//         }




//     },


//     getDomain: async () => {
//         const auth = await BX24.getAuth()
//         const domain = await BX24.getDomain()



//         return domain



//     },

//     getData: (actions, dateFrom, dateTo, departament) => {
//         // const start = new Date(dateFrom);
//         // const end = new Date(dateTo);

//         // console.log('getData')
//         // console.log(actions, departament)
//         const start = parseDateFromString(dateFrom);
//         const end = parseDateFromString(dateTo);
//         const diffMonths = differenceInMonths(end, start);

//         let resultData = null
//         // let periods = [];
//         departament?.forEach(user => {
//             const reportData = {
//                 user,
//                 callings: [],
//                 kpi: []
//             }

//             actions.forEach(action => {
//                 let periods = [];
//                 const kpi = {
//                     id: action.id,
//                     action: action.name,
//                     count: 0,
//                     periods: []

//                 }
//                 if (diffMonths > 22) {
//                     // Разбиваем на годы
//                     let tmpDate = start;
//                     while (tmpDate < end) {
//                         let nextDate = addMonths(tmpDate, 12);
//                         periods.push({ start: tmpDate, end: nextDate > end ? end : nextDate });
//                         tmpDate = nextDate;
//                     }
//                 } else if (diffMonths >= 3) {
//                     // Разбиваем на месяцы
//                     let tmpDate = start;
//                     while (tmpDate < end) {
//                         let nextDate = addMonths(tmpDate, 1);
//                         periods.push({ start: tmpDate, end: nextDate > end ? end : nextDate });
//                         tmpDate = nextDate;
//                     }
//                 } else {
//                     const diffWeeks = differenceInWeeks(end, start);
//                     if (diffWeeks > 3) {
//                         // Разбиваем на недели
//                         let tmpDate = start;
//                         while (tmpDate < end) {
//                             let nextDate = addWeeks(tmpDate, 1);
//                             periods.push({ start: tmpDate, end: nextDate > end ? end : nextDate });
//                             tmpDate = nextDate;
//                         }
//                     } else {
//                         // Разбиваем на дни
//                         let tmpDate = start;
//                         while (tmpDate < end) {
//                             let nextDate = addDays(tmpDate, 1);
//                             periods.push({ start: tmpDate, end: nextDate > end ? end : nextDate });
//                             tmpDate = nextDate;
//                         }
//                     }
//                 }

//                 // Теперь у вас есть periods, который содержит все периоды.
//                 // Здесь вы можете выполнить запросы для каждого периода и собрать результаты.

//                 // let total = 0; // Предположим, что total - это сумма какого-то значения из всех периодов.
//                 // let result = { user, total, start: dateFrom, end: dateTo, periods: [] };

//                 // Пример выполнения запроса для периода и обновление total и periods в result
//                 for (const period of periods) {

//                     const formattedStart = format(period.start, 'dd.MM.yyyy');
//                     const formattedEnd = format(period.end, 'dd.MM.yyyy');

//                     // Добавляем форматированные даты в результат

//                     kpi.periods.push({ start: formattedStart, end: formattedEnd, count: 0 });
//                     // Здесь вы должны выполнить запрос для каждого периода
//                     // Например, const response = await someApiCall(period.start, period.end);
//                     // И обновить total и periods в result на основе ответа
//                     // total += response.total;
//                     // result.periods.push({ start: period.start, end: period.end, data: response.data });
//                 }

//                 reportData.kpi.push(kpi)
//             });

//             resultData = reportData
//         });

//         // console.log(resultData)
//         return resultData;
//     },

//     getPeriodsReport: async (reportData) => {
//         const resultData = { ...reportData }
//         // console.log('getPeriodsReport resultData')
//         // console.log(resultData)
//         // for (const report of reportData) {
//         try {
//             for (const kpi of resultData.kpi) {
//                 for (const period of kpi.periods) {
//                     period.count = await bitrixReportAPI.getUserListsItemsCount(
//                         report.user.ID,
//                         kpi.id,
//                         period.start,
//                         period.end

//                     )

//                 }
//             }
//         } catch (error) {
//             console.log('error')
//             console.log(error)
//             return resultData
//         }

//         // }
//         // console.log('resultData')
//         // console.log(resultData)
//         return resultData
//     },

//     getUserListsItemsCount: async (userId, actionId, dateFrom, dateTo) => {
//         const method = 'lists.element.get';
//         const IBLOCK_TYPE_ID = 'lists';
//         const IBLOCK_ID = 86;
//         let result = 0; // Объект для группировки элементов по отделам


//         try {
//             const params = {
//                 IBLOCK_TYPE_ID,
//                 IBLOCK_ID,
//                 filter: {
//                     '>=PROPERTY_440': dateFrom,
//                     '<=PROPERTY_440': dateTo,
//                     'PROPERTY_446': userId, // Фильтр по ID отдела
//                     'PROPERTY_444': actionId
//                 },

//             };
//             const response = await BX24.callMethod(method, params);
//             console.log(response)

//             const data = response;
//             // console.log(response.total)
//             // console.log(response.answer)
//             // console.log(response.answer.total)

//             if (data && data.answer && data.answer.result) {
//                 if (data.answer.total) {
//                     // items = items.concat(data.answer.result);

//                     result = data.answer.total
//                 }

//             }

//         } catch (error) {
//             console.error(`Ошибка при получении элементов списка для отдела ${userId}:`, error);
//         }


//         return result;
//     },


//     getUserReport: async (userId, actions, dateFrom, dateTo) => {
//         const method = 'lists.element.get';
//         const IBLOCK_TYPE_ID = 'lists';
//         const IBLOCK_ID = 86;
//         let result = {
//             user: null,
//             userName: '',
//             kpi: [
//                 // {
//                 //     id: 0,
//                 //     action: '',
//                 //     count: 0
//                 // }
//             ]
//         }; // Объект для группировки элементов по отделам


//         try {
//             if (actions && actions.length) {
//                 for (let i = 0; i < actions.length; i++) {
//                     const params = {
//                         IBLOCK_TYPE_ID,
//                         IBLOCK_ID,
//                         filter: {
//                             '>=PROPERTY_440': dateFrom,
//                             '<=PROPERTY_440': dateTo,
//                             'PROPERTY_446': userId, // Фильтр по ID отдела
//                             'PROPERTY_444': actions[i].id
//                         },

//                     };
//                     const response = await BX24.callMethod(method, params);
//                     console.log(response)

//                     const data = response;
//                     // console.log(response.total)
//                     console.log(response.answer)
//                     console.log(response.answer.total)

//                     if (data && data.answer && data.answer.result) {
//                         if (data.answer.total) {
//                             // items = items.concat(data.answer.result);

//                             // result = data.answer.total
//                             result.kpi.push(
//                                 {
//                                     id: actions[i].id,
//                                     action: '',
//                                     count: 0
//                                 }
//                             )
                            
//                         }

//                     }

//                 }
//             }


//         } catch (error) {
//             console.error(`Ошибка при получении элементов списка для отдела ${userId}:`, error);
//         }


//         return result;


//     }
// }


