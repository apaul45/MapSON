import axios from 'axios'

axios.defaults.withCredentials = true

export const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    validateStatus: function (status) {
        return status >= 200 && status < 300; // default
    },
})