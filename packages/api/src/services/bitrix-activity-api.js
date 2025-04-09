// import { callMethod } from 'bx24-api';

// export const bitrixActivityAPI = {

//     setActivity: async (
//         companyId,
//         report,
//         description,
//         responsibilityId,
//         planEvent,
//         deadline,
//         // color
//     ) => {
//         const auth = window.BX24.getAuth()
//         console.log(auth)
        
//         let result = null
//         let dealResponse = null
//         const fields = {
//             // "RESPOSIBLE_ID": responsibilityId || 1,
//             // "DEADLINE": deadline
//             "responsibleId": responsibilityId || 1,
//             "deadline" : deadline,
//             "completed": "N",
//             "pingOffset" : [0, 5, 15, 30, 60],
//             // "badgeCode": "myCustomBadge"  // сначала зарегистрировать на портал е badge

//         }
//         let eventType = planEvent.code || 'Звонок'


//         let title = planEvent.name

//         // if (!isPlanned && currentTask) {
//         //     title = currentTask.title
//         // }


//         // https://dev.1c-bitrix.ru/rest_help/crm/rest_activity/configurable/structure/actiondto.php
//         const layout = {

//             "icon": {
//                 "code": "call-completed"
//             },
//             "header": {
//                 "title": title,
//                 "tags": {
//                     "status2": {
//                         "type": "warning",
//                         "title": "запланирован"
//                     }
//                 }
//             },
//             "body": {
//                 "logo": {
//                     "code": "call-incoming",
//                     "action": {
//                         "type": "openRestApp",
//                         "actionParams": {
//                             // 'ID': companyId,
//                             "companyId": companyId,
//                             "dealId": null,
//                             "eventType": eventType,
//                             "eventName": title,
//                             // "someImportant": "qwerty",
//                             // 'placement': 'COMPANY',
//                             // report: report,
//                             // plan: plan,
//                             // currentTask: currentTask ? currentTask.id : null,
//                         },
//                         "sliderParams": {
//                             "labelText": title,
//                             "labelColor": "#c3b3ff",
//                             "labelBgColor": "violet",
//                             "title": "Отчет по событию",
//                             "width": 1200
//                         },

//                     },
//                 },
//                 "blocks": {
//                     "deadline": {
//                         "type": "withTitle",
//                         "properties": {
//                             "title": "Крайний срок",
//                             "inline": true,
//                             "block": {
//                                 "type": "deadline",

//                             }
//                         }
//                     },
//                     "text": {
//                         "type": "largeText",
//                         "properties": {
//                             "value": description

//                         }
//                     },
//                     "client": {
//                         "type": "withTitle",
//                         "properties": {
//                             "title": "Клиент",
//                             "inline": true,
//                             "block": {
//                                 "type": "text",
//                                 // "properties": {
//                                 //     "value": currentCompany.TITLE
//                                 // }
//                             }
//                         }
//                     },
//                     "responsible": {
//                         "type": "lineOfBlocks",
//                         "properties": {
//                             "blocks": {
//                                 "client": {
//                                     "type": "link",
//                                     "properties": {
//                                         "text": title,
//                                         "bold": true,
//                                         "action": {
//                                             "type": "redirect",
//                                             "uri": "/crm/company/details/" + companyId + "/"
//                                         }
//                                     }
//                                 },
//                                 "phone": {
//                                     "type": "text",
//                                     "properties": {
//                                         "value": "+7 999 888 7777"
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }
//             },
//             "footer": {
//                 "buttons": {
//                     "startCall": {
//                         "title": "Отчитаться",
//                         "action": {
//                             "type": "openRestApp",
//                             "actionParams": {
//                                 // 'ID': companyId,
//                                 "companyId": companyId,
//                                 "dealId": null,
//                                 "eventType": eventType,
//                                 "eventName": title,
//                                 // report: report,
//                                 // plan: plan,
//                                 // currentTask: currentTask ? currentTask.id : null,
//                             },
//                             "sliderParams": {
//                                 "labelText": title,
//                                 "labelColor": "#c3b3ff",
//                                 "labelBgColor": "violet",
//                                 "title": "Отчет по событию",
//                                 "width": 1200
//                             },
//                         },
//                         // {
//                         //     "type": "openRestApp",
//                         //     "actionParams": {
//                         //         "clientId": companyId
//                         //     }
//                         // },
//                         "type": "primary"
//                     }
//                 },
//                 "menu": {
//                     "showPostponeItem": "false",
//                     "items": {
//                         "confirm": {
//                             "title": "Результативно",
//                             "action": {
//                                 "type": "restEvent",
//                                 "id": "confirm",
//                                 "animationType": "loader"
//                             }
//                         },
//                         "decline": {
//                             "title": "Не очень",
//                             "action": {
//                                 "type": "restEvent",
//                                 "id": "decline",
//                                 "animationType": "loader"
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//         const data = {
//             ownerTypeId: 4,
//             ownerId: companyId,
//             fields,
//             layout,


//         }

//         try {
//             dealResponse = await callMethod(
//                 'crm.activity.configurable.add',
//                 data
//             );
//             // console.log('setActivity')
//             // console.log('dealResponse')

//             if (dealResponse) {
//                 if (dealResponse.answer && dealResponse.answer.result) {
//                     result = dealResponse.answer.result

//                 }


//             }
//             return result
//         } catch (error) {
//             console.log('error')
//             console.log(dealResponse)
//             console.log(error)
//             return result
//         }

//     },


//     setInformationPresentationInit: async (link, companyId, responsibleId, name) => {
//         let result = null
//         let dealResponse = null
//         const fields = {
//             "RESPOSIBLE_ID": responsibleId
//         }
//         // https://dev.1c-bitrix.ru/rest_help/crm/rest_activity/configurable/structure/actiondto.php
//         const layout = {

//             "icon": {
//                 "code": "call-completed"
//             },
//             "header": {
//                 "title": "Заявка на презентацию",
//                 // "tags": {
//                 //     "status2": {
//                 //         "type": "warning",
//                 //         "title": "не расшифрован"
//                 //     }
//                 // }
//             },
//             "body": {
//                 "logo": {
//                     "code": "call-incoming",
//                     "action": {
//                         "type": "redirect",
//                         "uri": link
//                     }
//                 },
//                 "blocks": {
//                     "client": {
//                         "type": "withTitle",
//                         "properties": {
//                             "title": "Заявка",
//                             "inline": true,
//                             "block": {
//                                 "type": "link",

//                                 "properties": {
//                                     "value": name,
//                                     "url": link,
//                                 }
//                             }
//                         }
//                     },

//                 }
//             },
//             "footer": {
//                 "buttons": {
//                     "startCall": {
//                         "title": "Редактировать",
//                         "action": {
//                             "type": "openRestApp",
//                             "actionParams": {
//                                 "companyId": companyId,
//                                 "someImportant": "qwerty",
//                                 'placement': 'COMPANY',
//                             },
//                             "sliderParams": {
//                                 "labelText": "это приложение",
//                                 "labelColor": "#c3b3ff",
//                                 "labelBgColor": "violet",
//                                 "title": "Отчитаться",
//                                 "width": 1000
//                             },
//                         },
//                         // {
//                         //     "type": "openRestApp",
//                         //     "actionParams": {
//                         //         "clientId": companyId
//                         //     }
//                         // },
//                         "type": "primary"
//                     }
//                 },
//                 "menu": {
//                     "showPostponeItem": "false",
//                     "items": {
//                         "confirm": {
//                             "title": "Посмотреть заявку",
//                             "action": {
//                                 "type": "redirect",
//                                 "id": "confirm",
//                                 "uri": link
//                             }
//                         },
//                         "decline": {
//                             "title": "Редактировать заявку",
//                             "action": {
//                                 "type": "redirect",
//                                 "id": "decline",
//                                 "url": link
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//         const data = {
//             ownerTypeId: 4,
//             ownerId: companyId,
//             fields,
//             layout

//         }

//         try {
//             dealResponse = await callMethod(
//                 'crm.activity.configurable.add',
//                 data
//             );
//             console.log('setActivity')
//             console.log('dealResponse')

//             if (dealResponse) {
//                 if (dealResponse.answer && dealResponse.answer.result) {
//                     result = dealResponse.answer.result

//                 }


//             }
//             return result
//         } catch (error) {
//             console.log('error')
//             console.log(dealResponse)
//             console.log(error)
//             return result
//         }

//     },


// }


