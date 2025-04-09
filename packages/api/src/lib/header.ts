export const getApiHeaders = (apiKey:string) => ({
        'content-type': 'application/json',
        'accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-API-KEY': apiKey,    
    }
)