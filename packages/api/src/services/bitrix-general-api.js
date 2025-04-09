// // import * as BX24 from 'bx24-api';
// import { placement, getDomain } from "bx24-api";
// import { callMethod } from "bx24-api";
// import { resizeWindow } from "bx24-api";
// import { fitWindow } from "bx24-api";
// import { getScrollSize } from "bx24-api";
// import { scrollParentWindow } from "bx24-api";
// import { hookAPI } from "./april-hook-api";
// import { API_METHOD } from "../type/type";

// let getchunksDescriptionChunks = (dealId, bitrixFields, array, name) => {
//   let result = [];

//   let descriptChunk1 = [];
//   let descriptChunk2 = [];
//   let descriptChunk3 = [];
//   let descriptChunk4 = [];
//   // array.forEach((d, index) => {
//   //     if (index <= (array.length / 4)) {
//   //         descriptChunk1.push(d)
//   //     } else if (index > (array.length / 4) && index <= (array.length / 3)) {
//   //         descriptChunk2.push(d)
//   //     } else if (index > (array.length / 3) && index <= (array.length / 2)) {
//   //         descriptChunk3.push(d)
//   //     } else {
//   //         descriptChunk4.push(d)
//   //     }
//   // })
//   let fields = [];
//   array.forEach((d, index) => {
//     fields.push(d);
//   });
//   result.push([
//     "crm.deal.update",
//     { ID: dealId, FIELDS: { [bitrixFields[name].bitrixId]: descriptChunk1 } },
//   ]);
//   result.push([
//     "crm.deal.update",
//     { ID: dealId, FIELDS: { [bitrixFields[name].bitrixId]: descriptChunk2 } },
//   ]);
//   // result.push(['crm.deal.update', { ID: dealId, FIELDS: { [bitrixFields[name].bitrixId]: descriptChunk3 } }])
//   // result.push(['crm.deal.update', { ID: dealId, FIELDS: { [bitrixFields[name].bitrixId]: descriptChunk4 } }])
//   return ["crm.deal.update", { ID: dealId, FIELDS: { [bitrixFields[name].bitrixId]: fields } }];
// };
// export const bitrixAPI = {
//   // initialBitrix: async () => {
//   //     bx24 = await window.BX24
//   //     return bx24
//   // },

//   getMethod: async (method, data, domain = null) => {
//     let result = null;
//     let dealResponse = null;
//     try {
//       if (__IN_BITRIX__) {
//         dealResponse = await callMethod(method, data);
//       } else {
//         const bxReqHookData = {
//           domain,
//           method,
//           bxData: data,
//         };
//         result = await hookAPI.service("bitrix/method", API_METHOD.POST, "result", bxReqHookData);
//       }
//       if (dealResponse) {
//         if (dealResponse.answer && dealResponse.answer.result) {
//           result = dealResponse.answer.result;
//         }
//       }

//       return result;
//     } catch (error) {
//       console.log("error");
//       console.log(dealResponse);
//       console.log(error);

//       return result;
//     }
//   },
//   getPlacement: async () => {
//     // if (testbx24) {
//     const plcmnt = await placement.info();

//     return plcmnt;
//     // } else {
//     //     return null
//     // }
//   },

//   getCompanyId: async () => {
//     try {
//       const info = await bitrixAPI.getPlacement();
//       const companyId = info.options.ID;
//       return Number(companyId);
//     } catch (error) {
//       return null;
//     }
//   },

//   getCurrentUserId: async (companyId) => {
//     let userId = null;
//     // if (window.BX24 && window.BX24.callMethod) {

//     let company = await callMethod("crm.company.get", { id: companyId });
//     company = company.answer && company.answer.result;
//     userId = company ? company["ASSIGNED_BY_ID"] : null;

//     // }

//     return userId;
//   },

//   getCurrentUser: async () => {
//     let currentUser = null;
//     try {
//       const currentUserData = await callMethod("user.current");

//       if (currentUserData) {
//         if (currentUserData.answer) {
//           if (currentUserData.answer.result) {
//             if (currentUserData.answer.result.ID) {
//               currentUser = currentUserData.answer.result;
//             }
//           }
//         }
//       }
//       return currentUser;
//     } catch (error) {
//       console.log(error);
//       return null;
//     }
//   },

//   getResize: async (isPreloder = false) => {
//     try {
//       const screenHeight = window.screen.height * 0.9;
//       const screenWidth = window.screen.width * 0.73;

//       let response = await resizeWindow(screenWidth, screenHeight);
//     } catch (error) {
//       console.log("no resize");
//     }

//     // const timer = setTimeout(async () => {

//     //     await bitrixAPI.getScroll()

//     // }, 500);

//     // return () => clearTimeout(timer);
//   },
//   getResizeCalling: async (isPreloder = false) => {
//     const screenHeight = window.screen.height * 0.6;
//     const screenWidth = window.screen.width * 0.8;

//     // let response = await BX24.resizeWindow(screenWidth, screenHeight)
//     let response = await fitWindow();

//     // const timer = setTimeout(async () => {

//     //     await bitrixAPI.getScroll()

//     // }, 500);

//     // return () => clearTimeout(timer);
//   },
//   getFit: async () => {
//     try {
//       await fitWindow();
//     } catch (error) {
//       console.log(error);
//     }
//   },
//   getScroll: async () => {
//     try {
//       console.log("scroll");
//       let scrollSize = await getScrollSize();
//       console.log(scrollSize);
//       let response = await scrollParentWindow(100);
//       console.log(response);
//     } catch (error) { }
//   },
//   getLead: async (leadId) => {
//     let result = null;
//     console.log("crm.lead.get");
//     try {
//       const dealResponse = await callMethod("crm.lead.get", { id: leadId });
//       if (dealResponse) {
//         if (dealResponse.answer && dealResponse.answer.result) {
//           result = dealResponse.answer.result;
//           console.log(result);
//         }
//       }
//       return result;
//     } catch (error) {
//       console.log("error");
//       console.log(dealResponse);
//       console.log(error);
//       return result;
//     }
//   },
//   getCompany: async (companyId) => {
//     let result = null;
//     console.log("crm.company.get");
//     try {
//       const dealResponse = await callMethod("crm.company.get", {
//         id: companyId,
//         // select:
//         // ['TITLE', 'ID', 'UF_CRM_1706007840', 'UF_CRM_1706007882', 'UF_CRM_1706007856']
//       });
//       if (dealResponse) {
//         if (dealResponse.answer && dealResponse.answer.result) {
//           result = dealResponse.answer.result;
//           console.log(result);
//         }
//       }
//       return result;
//     } catch (error) {
//       console.log("error");
//       console.log(dealResponse);
//       console.log(error);
//       return result;
//     }
//   },
//   getDeal: async (dealId) => {
//     let result = null;

//     try {
//       const dealResponse = await callMethod("crm.deal.get", {
//         id: dealId,
//         select: [
//           "TITLE",
//           "COMPANY_ID",
//           "ID",
//           "UF_CRM_1695372881",
//           "UF_CRM_1695373462",
//           "UF_CRM_1695373326",
//         ],
//       });
//       if (dealResponse) {
//         if (dealResponse.answer && dealResponse.answer.result) {
//           result = dealResponse.answer.result;
//         }
//       }
//       return result;
//     } catch (error) {
//       console.log("error");
//       console.log(dealResponse);
//       console.log(error);
//       return result;
//     }
//   },

//   getDealAndCompany: async (dealId = null, currentCompanyId = null, domain = null) => {
//     try {
//       // Если companyId не предоставлен, но предоставлен dealId, пытаемся получить companyId из сделки.
//       let dealResult = null;
//       let companyResult = null;

//       if (!currentCompanyId && dealId) {
//         dealResult = await bitrixAPI.getMethod(
//           "crm.deal.get",
//           { id: dealId },
//           domain
//         );

//         // await bitrixAPI.getDeal(dealId);
//         if (dealResult && dealResult.COMPANY_ID) {
//           // Здесь предполагается, что результат содержит поле COMPANY_ID
//           currentCompanyId = dealResult.COMPANY_ID;

//           // companyResult = await bitrixAPI.getCompany(currentCompanyId);

//           companyResult = await bitrixAPI.getMethod(
//             "crm.company.get",
//             { id: currentCompanyId },
//             domain
//           );
//         }
//       } else if (currentCompanyId && !dealId) {
//         // companyResult = await bitrixAPI.getCompany(currentCompanyId);
//         companyResult = await bitrixAPI.getMethod(
//           "crm.company.get",
//           { id: currentCompanyId },
//           domain
//         );

//         if (dealResult && dealResult.COMPANY_ID) {
//           // Здесь предполагается, что результат содержит поле COMPANY_ID
//           currentCompanyId = dealResult.COMPANY_ID;
//         }
//       }
//       // console.log('dealResult')
//       // console.log(dealResult)
//       // console.log('currentCompanyId')
//       // console.log(currentCompanyId)

//       // console.log('Результаты batch запроса:');
//       // console.log('Компания:', companyResult);
//       // console.log('Сделка:', dealResult);

//       return { company: companyResult, deal: dealResult };
//     } catch (error) {
//       console.error("Произошла ошибка при выполнении запроса", error);
//       return { company: null, deal: null };
//     }
//   },

//   getSmart: async (entityTypeId) => {
//     let result = null;
//     $method = "/crm.item.list.json";
//     $data = {
//       entityTypeId: entityTypeId,
//       filter: {
//         "=assignedById": $userId,
//         COMPANY_ID: $companyId,
//       },
//     };
//     try {
//       const dealResponse = await callMethod("crm.item.list", { id: dealId });
//       if (dealResponse) {
//         if (dealResponse.answer && dealResponse.answer.result) {
//           result = dealResponse.answer.result["items"];
//         }
//       }
//       return result;
//     } catch (error) {
//       console.log("error");
//       console.log(dealResponse);
//       console.log(error);
//       return result;
//     }
//   },

//   getDomain: async () => {
//     // const auth = await getAuth()
//     const domain = await getDomain();
//     return domain;
//   },

//   updateRecipient: async (dealId, companyId, inn, position, name) => {
//     if (dealId || companyId) {
//       if (inn || position || name) {
//         // company: null,
//         //ИНН UF_CRM_1706007840
//         //ФИО UF_CRM_1706007882
//         //Должность UF_CRM_1706007856
//         // companyNamae
//         // deal: null
//         // ИНН UF_CRM_1695372881
//         // ФИО UF_CRM_1695373462
//         // Должность UF_CRM_1695373326
//         const fieldsUpdateCompany = {
//           //поля для обновления company
//           // 'UF_CRM_1706007840': inn,
//           // 'UF_CRM_1695373326': position,
//           // 'UF_CRM_1706007882': name,
//         };
//         const fieldsUpdateDeal = {
//           //поля для обновления сделки
//           // 'UF_CRM_1695372881': inn,
//           // 'UF_CRM_1695373326': position,
//           // 'UF_CRM_1695373462': name,
//         };
//         if (inn) {
//           fieldsUpdateCompany["UF_CRM_1706007840"] = inn;
//           fieldsUpdateDeal["UF_CRM_1695372881"] = inn;
//         }
//         if (position) {
//           fieldsUpdateCompany["UF_CRM_1706007856"] = position;
//           fieldsUpdateDeal["UF_CRM_1695373326"] = position;
//         }

//         if (name) {
//           fieldsUpdateCompany["UF_CRM_1706007882"] = name;
//           fieldsUpdateDeal["UF_CRM_1695373462"] = name;
//         }

//         const dealUpdateParams = {
//           ID: dealId,
//           FIELDS: {
//             ...fieldsUpdateDeal,
//           },
//           PARAMS: { REGISTER_SONET_EVENT: "Y" },
//         };
//         const companyUpdateParams = {
//           ID: companyId,
//           FIELDS: {
//             ...fieldsUpdateCompany,
//           },
//           PARAMS: { REGISTER_SONET_EVENT: "Y" },
//         };
//         const methodDeal = "crm.deal.update";
//         const methodCompany = "crm.company.update";
//         let deal = null;
//         let company = null;
//         try {
//           let deealData = await callMethod(methodDeal, { ...dealUpdateParams });
//           let companyData = await callMethod(methodCompany, { ...companyUpdateParams });
//           deal = deealData.answer && deealData.answer.result;
//           company = companyData.answer && companyData.answer.result;
//           return { deal, company };
//         } catch (error) {
//           return deal;
//         }
//       }
//     }
//   },
// };
