import axios from "axios";
import {authenticationInterceptor} from "@/iam/services/authentication.interceptor.js";

const httpInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
});


httpInstance.interceptors.request.use(authenticationInterceptor);


export default httpInstance;