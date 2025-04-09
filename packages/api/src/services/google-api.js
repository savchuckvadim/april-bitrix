import axios from "axios";


// const token = 'TOKEN'


const instance = axios.create({
    baseURL: `https://script.google.com/macros/s`,
    headers: {
        "Content-Type": "text/plain;charset=utf-8",
    },
})

const instanceToken = axios.create({
    headers: {
        "Content-Type": "text/plain;charset=utf-8",
    },
});

instance.defaults.redirect = "follow";
instanceToken.defaults.redirect = "follow";

export const googleAPI = {

    async getInitialData(token) {

        try {
            const response = await instance.get(`/${token}/exec`);
            if (response.data) {
                return response.data;
            }

        } catch (error) {
            
        }
    },

    async getToken(domain) {

        try {
            const response = await instanceToken.get(`https://script.google.com/macros/s/AKfycbymfb_P5F7tUxh_-btwe4WyIVB0Lrqa4w1Np7jsqOQJ5JxjJjBNvxZXWJf0NlUVoVK6JA/exec?domain=${domain}`);

            if (response.data) {

                return response.data.token;
            }
        } catch (error) {
            
        }
    }
}
