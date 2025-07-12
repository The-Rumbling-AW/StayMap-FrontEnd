import {useAuthStore} from "./authentication.store.js";

/**
 * Interceptor to add authentication token to the request
 * @param config - Axios request configuration
 * @returns {AxiosRequestConfig} - Updated Axios request configuration
 */
export const authenticationInterceptor = (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
        console.log("✅ Token enviado:", user.token);
    } else {
        console.log("⚠️ No se encontró token en localStorage");
    }
    return config;
};