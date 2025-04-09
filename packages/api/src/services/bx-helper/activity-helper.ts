export const getLayout = (
    companyId:number,
    dealId:number | '',

    title:string,
    description: string,
    eventType: string,
    deadline: string,
    color:string
) => {
    return {
    
        "icon": {
            "code": "call-completed"
        },
        "header": {
            "title": title,
            "tags": {
                "status2": {
                    "type": "warning",
                    "title": "запланирован"
                }
            }
        },
        "body": {
            "logo": {
                "code": "call-incoming",
                "action": {
                    "type": "openRestApp",
                    "actionParams": {
                        // 'ID': companyId,
                        "companyId": companyId,
                        "dealId": dealId,
                        "eventType": eventType,
                        "eventName": title,
                        // "someImportant": "qwerty",
                        // 'placement': 'COMPANY',
                        // report: report,
                        // plan: plan,
                        // currentTask: currentTask ? currentTask.id : null,
                    },
                    "sliderParams": {
                        "labelText": title,
                        "labelColor": "#c3b3ff",
                        "labelBgColor": "violet",
                        "title": "Отчет по событию",
                        "width": 1200
                    },

                },
            },
            "blocks": {
                "deadline": {
                    "type": "withTitle",
                    "properties": {
                        "title": "Крайний срок",
                        "inline": true,
                        "block": {
                            "type": deadline,

                        }
                    }
                },
                "text": {
                    "type": "largeText",
                    "properties": {
                        "value": description

                    }
                },
                "client": {
                    "type": "withTitle",
                    "properties": {
                        "title": "Клиент",
                        "inline": true,
                        "block": {
                            "type": "text",
                            // "properties": {
                            //     "value": currentCompany.TITLE
                            // }
                        }
                    }
                },
                "responsible": {
                    "type": "lineOfBlocks",
                    "properties": {
                        "blocks": {
                            "client": {
                                "type": "link",
                                "properties": {
                                    "text": title,
                                    "bold": true,
                                    "action": {
                                        "type": "redirect",
                                        "uri": "/crm/company/details/" + companyId + "/"
                                    }
                                }
                            },
                            "phone": {
                                "type": "text",
                                "properties": {
                                    "value": "+7 999 888 7777"
                                }
                            }
                        }
                    }
                }
            }
        },
        "footer": {
            "buttons": {
                "startCall": {
                    "title": "Отчитаться",
                    "action": {
                        "type": "openRestApp",
                        "actionParams": {
                            // 'ID': companyId,
                            "companyId": companyId,
                            "dealId": '',
                            "eventType": eventType,
                            "eventName": title,
                            // report: report,
                            // plan: plan,
                            // currentTask: currentTask ? currentTask.id : null,
                        },
                        "sliderParams": {
                            "labelText": title,
                            "labelColor": color || "#c3b3ff",
                            "labelBgColor": "violet",
                            "title": "Отчет по событию",
                            "width": 1200
                        },
                    },
                    // {
                    //     "type": "openRestApp",
                    //     "actionParams": {
                    //         "clientId": companyId
                    //     }
                    // },
                    "type": "primary"
                }
            },
            "menu": {
                "showPostponeItem": "false",
                "items": {
                    "confirm": {
                        "title": "Результативно",
                        "action": {
                            "type": "restEvent",
                            "id": "confirm",
                            "animationType": "loader"
                        }
                    },
                    "decline": {
                        "title": "Не очень",
                        "action": {
                            "type": "restEvent",
                            "id": "decline",
                            "animationType": "loader"
                        }
                    }
                }
            }
        }
    }
}