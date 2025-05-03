// import { ONLINE_API_KEY } from "@/app/secret/online-secret";
// import { getConfig } from "@/lib/config";
import axios from "axios";


const isHook = false // __SERVER__ == 'hook'
export const url = isHook ? `https://april-online.ru/api` : `https://garant-app.ru/api`


const online = axios.create({
    baseURL: url,

    withCredentials: true,
    headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        // 'X-API-KEY': getConfig().apiKey || ''

    },
})


// online.defaults.redirect = "follow";
const authOnline = axios.create({

    baseURL: url,

    withCredentials: true,
    headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        // 'X-XSRF-TOKEN': getCookie('XSRF-TOKEN'),
        'X-Requested-With': 'XMLHttpRequest'
    },
})
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
export const auth = {
    async initial() {

        try {
            let res = await authOnline.get("/sanctum/csrf-cookie");

            return res;
        } catch (error) {
            console.log(error)
        }

    },
    async getSanctumTest() {

        let res = await online.get("/sntm/test");

        return console.log(res);
    },
}


export const onlineAPI = {
    getCurrentUser: async () => {
        let result = null
        try {
            const response = await online.get('profile')
            const data = response.data

            if (data) {
                if (data.resultCode === 0) {
                    result = data.deal
                } else {
                    if (data.message) {

                    }
                }
            }
            return result
        } catch (error) {

            return result
        }
    },


    setDeal: async (deal) => {
        let result = null
        try {
            const data = await online.post('deal', {
                ...deal,
                // portalId: deal.domain
            })
            if (data) {
                if (data.resultCode === 0) {
                    result = data.deal
                } else {
                    if (data.message) {

                    }
                }
            }
            return result
        } catch (error) {

            return result
        }
    },

    getDeal: async (dealId, domain) => {
        let result = null
        try {
            const fetched = await online.post('getDeal', {
                dealId, domain
            })
            const data = fetched.data

            if (data) {

                if (data.resultCode === 0) {
                    result = data.deal
                } else {
                    if (data) {

                    }
                }
            }
            return result
        } catch (error) {

            return result
        }
    },

    // getDescription: async (complect, infoblocks, groups) => {


    //     // complect : {complectName: 'name', supply: '1 ОД'}
    //     // groups : [{'groupId': 1, 'groupName': 'efe'}]
    //     // infoblocks : [{'infoblockId': 1, 'groupName': 'efe', name: 'Законодательство', description : 'text'}]
    //     //
    //     let result = null
    //     try {
    //         const response = await online.post('getDescription', {
    //             complect, infoblocks, groups
    //         })

    //         const data = response.data
    //         
    //         
    //         if (data) {
    //             if (data.resultCode === 0) {
    //                 result = data.deal
    //             } else {
    //                 if (data.message) {
    //                     
    //                 }
    //             }
    //         }
    //         return result
    //     } catch (error) {

    //     }

    // },

    getDescription: async (domain, userId, complect, infoblocks, groups) => {
        let result = null
        try {
            const response = await online.post('getDescription', {
                domain, userId, complect, infoblocks, groups
            })
            if (response && response.data && response.data.resultCode === 0) {
                let link = response.data.file
                let file = response.data.fileBase64

                return { link, file }
            }

        } catch (error) {

            return result
        }

    },
    getOffer: async (domain, userId, complect, infoblocks, groups) => {
        let result = null
        try {
            const response = await online.post('get/offer', {
                domain, userId, complect, infoblocks, groups
            })

            if (response && response.data && response.data.resultCode === 0) {





            }

        } catch (error) {

            return result
        }

    },

    getTemplate: async (domain, userId, type,) => {
        let result = null
        try {
            const response = await online.post('get/offer', {
                domain, userId, complect, infoblocks, groups
            })

            if (response && response.data && response.data.resultCode === 0) {





            }

        } catch (error) {

            return result
        }

    }
}


export const onlineGeneralAPI = {
    getCollection: async (url, method, collectionName, data) => {
        let result = null

        try {
            const response = !data
                ? await online[method](url)
                : await online[method](url, data)


            if (response) {


                if (response.data && response.data.resultCode === 0) {
                    if (response.data[collectionName]) {

                        if (response.data.isCollection) {

                            result = response.data[collectionName].data
                        } else {

                            result = response.data[collectionName]
                        }

                    }

                }


                return result

            }

        } catch (error) {




            return result
        }

    },
    setCollection: async (name, items) => {
        let result = null
        try {
            const data = {
                [name]: items
            }
            const response = await online.post(name, data)
            if (response) {
                if (response.data.resultCode === 0) {
                    result = response.data.data
                } else {

                }
            }
            return result
        } catch (error) {

            return result
        }

    },
    service: async (url, method, model, data) => {
        let result = null
        try {

            const response = await online[method](url, data)
            console.log('online response')

            console.log(response)
            if (response && response.data) {

                if (response.data.resultCode === 0) {

                    if (response.data.data) {
                        result = response.data.data[model]
                    } else {
                        result = response.data[model]
                    }

                } else if (response.data.resultCode === 1) {

                    if (response.data.message) {
                        console.log(`${model} ${response.data.message}`)
                    } else {
                        console.log(response)
                    }

                }
            }

            return result
        } catch (error) {

            console.log('online error')

            console.log(error)

            return result
        }
    },

    post: async (url, method, data, headers) => {
        let result = null
        try {

            const response = await online[method](url, data, { headers })
            console.log('online headers response')

            // console.log(response)
            if (response && response.data) {

                if (response.data.resultCode === 0) {

                    if (response.data.data) {
                        result = response.data.data
                    } else {
                        result = response.data
                    }

                } else if (response.data.resultCode === 1) {

                    if (response.data.message) {
                        console.log(`${model} ${response.data.message}`)
                    } else {
                        console.log(response)
                    }

                }
            }

            return result
        } catch (error) {

            console.log('online error')

            console.log(error)

            return result
        }
    }
}



export const onlineDealAPI = {

    updateDeal: async (
        domain,

        //for set deal
        dealName,
        currentUserId,


        dealId,
        contractId,
        companyId,
        infoblocks,
        er,
        freeBlocks,
        lt,
        consalting,  //infoblocks
        star,
        bitrixFieldsDealUpdate,
        bitrixFieldsDealAdd,

        //contract fields
        bitrixProductFields,
        currentProduct,
        currentConsaltingProduct,


        //product row fields
        products,  //todo only general

    ) => {
        let result = null




        const setDealData = {
            FIELDS:
            {
                [bitrixFieldsDealAdd.dealName.bitrixId]: `${dealName}`,
                [bitrixFieldsDealAdd.assigned.bitrixId]: currentUserId,


                [bitrixFieldsDealAdd.category.bitrixId]: bitrixFieldsDealAdd.category.value,
                [bitrixFieldsDealAdd.stage.bitrixId]: bitrixFieldsDealAdd.stage.value,
                // bitrixFields.stage.value,
                [bitrixFieldsDealAdd.opened.bitrixId]: bitrixFieldsDealAdd.opened.value,

                "PROBABILITY": 30,
                "OPPORTUNITY": 0,
                "CURRENCY_ID": "RUB",
                'UF_CRM_5B39D7C2EC0AB': true

            },
            PARAMS: { "REGISTER_SONET_EVENT": "Y" }
        }





        let contractSupplyPropSuppliesQuantity = isNaN(+currentProduct.contractSupplyPropSuppliesQuantity) ? 1 : +currentProduct.contractSupplyPropSuppliesQuantity;
        let contractConsaltingProp = currentConsaltingProduct ? currentConsaltingProduct.contractConsaltingProp : currentProduct.contractConsaltingProp
        let contractConsaltingComment = currentConsaltingProduct ? currentConsaltingProduct.contractConsaltingComment : currentProduct.contractConsaltingComment


        const updateDealInfoblocksData = {
            id: dealId,
            fields:
            {
                //ИНФОБЛОКИ, ПРИВЯЗКА К КОМПАНИИ, ТИП ДОГОВОРА
                //CATEGORY AND STAGE
                [bitrixFieldsDealUpdate.contract.bitrixId]: contractId,
                [bitrixFieldsDealUpdate.companyId.bitrixId]: companyId,
                [bitrixFieldsDealUpdate.npa.bitrixId]: infoblocks.npa,
                [bitrixFieldsDealUpdate.la.bitrixId]: infoblocks.la,
                [bitrixFieldsDealUpdate.c.bitrixId]: infoblocks.c,
                [bitrixFieldsDealUpdate.sp.bitrixId]: infoblocks.sp,
                [bitrixFieldsDealUpdate.er.bitrixId]: er.er,
                [bitrixFieldsDealUpdate.per.bitrixId]: er.per,
                [bitrixFieldsDealUpdate.erinpac.bitrixId]: er.erinpac,
                [bitrixFieldsDealUpdate.lt.bitrixId]: lt.lt,
                [bitrixFieldsDealUpdate.plt.bitrixId]: lt.plt,
                [bitrixFieldsDealUpdate.ltinpac.bitrixId]: lt.ltinpac,
                [bitrixFieldsDealUpdate.freeBlocks.bitrixId]: freeBlocks,
                [bitrixFieldsDealUpdate.consalting.bitrixId]: consalting,
                [bitrixFieldsDealUpdate.field_14.bitrixId]: star,
                [bitrixFieldsDealAdd.category.bitrixId]: bitrixFieldsDealAdd.category.value,
                [bitrixFieldsDealAdd.stage.bitrixId]: `C${bitrixFieldsDealAdd.category.value}:NEW`,


            },
            PARAMS: { "REGISTER_SONET_EVENT": "Y" }
        }

        const updateDealContractData = {
            id: dealId,
            fields:
            {

                //ПОЛЯ СВЯЗАННЫЕ С ДОГОВОРОМ
                [bitrixProductFields.complectName.bitrixId]: currentProduct.name,
                [bitrixProductFields.abonementTime.bitrixId]: currentProduct.contractCoefficient === 1 ? null : currentProduct.contractCoefficient,
                [bitrixProductFields.consalting.bitrixId]: contractConsaltingProp,
                [bitrixProductFields.note2.bitrixId]: contractConsaltingComment,

                [bitrixProductFields.hdd.bitrixId]: currentProduct.contractSupplyProp1 ? currentProduct.contractSupplyProp1 : '',
                [bitrixProductFields.way.bitrixId]: currentProduct.contractSupplyProp2 ? currentProduct.contractSupplyProp2 : '',
                // [bitrixFields.measureId.bitrixId]: currentProduct.prepayment,
                [bitrixProductFields.note.bitrixId]: currentProduct.contractSupplyPropComment ? currentProduct.contractSupplyPropComment : '',

                [bitrixProductFields.note3.bitrixId]: currentProduct.contractSupplyPropEmail ? currentProduct.contractSupplyPropEmail : '',
                [bitrixProductFields.supply.bitrixId]: currentProduct.supplyName ? currentProduct.supplyName : '',
                [bitrixProductFields.supplyForContract.bitrixId]: currentProduct.contractSupplyName ? currentProduct.contractSupplyName : '',

                [bitrixProductFields.loginsQuantity.bitrixId]: currentProduct.contractSupplyPropLoginsQuantity ? currentProduct.contractSupplyPropLoginsQuantity : '',
                [bitrixProductFields.contractSupplyPropSuppliesQuantity.bitrixId]: contractSupplyPropSuppliesQuantity,
                [bitrixProductFields.supplyForContract.bitrixId]: currentProduct.contractSupplyName,
                [bitrixProductFields.field_1.bitrixId]: currentProduct.quantityForKp,

            },
            // PARAMS: { "REGISTER_SONET_EVENT": "Y" }
        }


        const rows = products.map((product, i) => {

            let quantity = product.prepayment

            // const price = product.price.default

            let priceCurrent = product.price.current
            const priceNetto = product.price.default
            const discountSum = priceNetto - priceCurrent


            let row = {
                "id": product.id || product.number,
                "priceNetto": priceNetto,
                "price": priceCurrent,
                "discountSum": discountSum,
                "discountTypeId": 1,
                "ownerId": dealId,
                "ownerType": "D",
                "productName": `${product.name} ${product.supply.name}`,
                "quantity": product.price.quantity || quantity,
                "customized": "Y",
                "supply": product.supplyName,
                "measureCode": product.price.measure.code,
                "measureId": product.price.measure.id,
                "sort": i,
            }


            return row
        })


        const setProductRowsData = {
            ownerType: 'D',
            ownerId: dealId,
            productRows: rows,

        }

        const updateProductRowsData = {
            id: null,
            fields: {
                'priceNetto': null,
                "price": null,
                "discountSum": null,
                "discountTypeId": 1,
            }
        }

        const data = {
            domain: domain,
            dealId: dealId,
            setDealData,
            updateDealInfoblocksData,
            updateDealContractData,
            setProductRowsData,
            updateProductRowsData
        }


        try {

            //todo base url
            const response = await online[API_METHOD.POST](
                'konstructor/bitrix/deal/update'
                , data)

            if (response && response.data) {

                if (response.data.resultCode === 0) {

                    if (response.data.data) {
                        result = response.data.data['dealId']
                    }
                    // else {
                    //     result = response.data['dealId']
                    // }

                } else if (response.data.resultCode === 1) {

                    if (response.data.message) {
                        console.log(`${response.data.message}`)
                    } else {
                        console.log(response)
                    }

                }
            }

            return result
        } catch (error) {



            return result
        }
    }
}


const maxOnline = axios.create({
    // baseURL: `https://garant-app.ru/api`,
    baseURL: `http://localhost:8000/api`,

    withCredentials: true,
    headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        // 'Access-Control-Allow-Origin': '*',
        'X-Requested-With': 'XMLHttpRequest'
    },
})

export const maxOnlineAPI = {

    service: async (url, method, model, data) => {
        let result = null
        try {

            const response = await maxOnline[method](url, data)

            if (response && response.data) {

                if (response.data.resultCode === 0) {

                    if (response.data.data) {
                        result = response.data.data[model]
                    } else {
                        result = response.data[model]
                    }

                } else if (response.data.resultCode === 1) {

                    if (response.data.message) {
                        console.log(`${model} ${response.data.message}`)
                    } else {
                        console.log(response)
                    }

                }
            }

            return result
        } catch (error) {



            return result
        }
    }
}
