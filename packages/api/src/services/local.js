

export const localAPI = {
    getData: async (name) => {
        let myStorage;
        let data = null

        try {

            myStorage = window.localStorage;
            data = myStorage.getItem(name); // Попробуйте записать что-то в localStorage

            return data

        } catch (e) {

            // Если возникла ошибка (например, из-за отключенного localStorage), 
            // вы можете показать сообщение пользователю или обработать это иначе
            console.log("Ваш браузер не поддерживает использование localStorage или он отключен. Некоторые функции могут быть ограничены. Обратитесь к Админимстратору.");
            return data
        }

    },
    getParsedData: async (name) => {
        let myStorage;
        let data = null

        try {

            myStorage = window.localStorage;
            data = myStorage.getItem(name); // Попробуйте записать что-то в localStorage
            const parsedData = JSON.parse(data)
            return parsedData

        } catch (e) {

            // Если возникла ошибка (например, из-за отключенного localStorage), 
            // вы можете показать сообщение пользователю или обработать это иначе
            console.log("Ваш браузер не поддерживает использование localStorage или он отключен. Некоторые функции могут быть ограничены. Обратитесь к Админимстратору.");
            return data
        }

    },

    setData: async (data, name) => {
        try {
            let myStorage;
            let jsnData = JSON.stringify({ ...data })
            myStorage = window.localStorage;
            myStorage.setItem(name, jsnData);
            let jsnupdtdData = myStorage.getItem(name);
            let updtdData = JSON.parse(jsnupdtdData)

            return updtdData

        } catch (e) {
            // Если возникла ошибка (например, из-за отключенного localStorage), 
            // вы можете показать сообщение пользователю или обработать это иначе
            console.log("Ваш браузер не поддерживает использование localStorage или он отключен. Некоторые функции могут быть ограничены. Обратитесь пожалуйста к разработчику");
            return null
        }

    },

    setReportData: async (data, name) => {
        try {
            let myStorage;
            let jsnData = JSON.stringify(data)
            myStorage = window.localStorage;
            myStorage.setItem(name, jsnData);
            let jsnupdtdData = myStorage.getItem(name);
            let updtdData = JSON.parse(jsnupdtdData)

            return updtdData

        } catch (e) {
            // Если возникла ошибка (например, из-за отключенного localStorage), 
            // вы можете показать сообщение пользователю или обработать это иначе
            console.log("Ваш браузер не поддерживает использование localStorage или он отключен. Некоторые функции могут быть ограничены. Обратитесь пожалуйста к разработчику");
            return null
        }
    }

}