import axios from 'axios';
require('dotenv').config()

const instance = axios.create({

    //base url from firebase cloud functions
    baseURL: process.env.AXIOS_BASE_URL
})

export default instance;