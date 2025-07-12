import httpInstance from "../../shared/services/http.instance.js";
import {Concert} from "@/concerts/model/concert.entity.js";

/**
 * @class CategoryService
 * @description Service class for handling CRUD operations on concerts using HTTP requests
 */
export class ConcertService {
    /** @type {string} The API endpoint for concerts */
    resourceEndpoint = import.meta.env.VITE_CONCERTS_ENDPOINT_PATH;

    /**
     * Retrieves all concerts
     * @returns {Promise<AxiosResponse<any>>} Promise that resolves to an array of categories
     */
    getAll() {
        return httpInstance.get(`${this.resourceEndpoint}/list`); // usa el endpoint con [AllowAnonymous]
    }

    async getAllConcerts() {
        const { data } = await httpInstance.get(`${this.resourceEndpoint}/list`);
        const concertList = Array.isArray(data) ? data : data.data || [];
        return concertList.map(concert => new Concert(concert));
    }



    /**
     * Retrieves a concerts by its ID
     * @param {number|string} id - The ID of the category to retrieve
     * @returns {Promise<AxiosResponse<any>>} Promise that resolves to the category object
     */
    async getById(id) {
        const { data } = await httpInstance.get(`${this.resourceEndpoint}/${id}`);
        return { data: new Concert(data) };
    }


    /**
     * Creates a new concert
     * @param {Object} resource - The concert object to create
     * @param {string} resource.name - The name of the concert
     * @returns {Promise<AxiosResponse<any>>} Promise that resolves to the created category
     */
    create(resource) {
        return httpInstance.post(this.resourceEndpoint, resource);
    }

    /**
     * Updates an existing category
     * @param {number|string} id - The ID of the category to update
     * @param {Object} resource - The updated category data
     * @param {string} resource.name - The updated name of the category
     * @returns {Promise<AxiosResponse<any>>} Promise that resolves to the updated category
     */
    update(id, resource) {
        return httpInstance.put(`${this.resourceEndpoint}/${id}`, resource);
    }

    attendConcert(concertId, userId) {
            return httpInstance.post(`${this.resourceEndpoint}/${concertId}/attend?userId=${userId}`);
    }

    toggleAttendance(concertId, userId) {
        return httpInstance.post(`${this.resourceEndpoint}/${concertId}/toggle-attendance?userId=${userId}`);
    }

    deleteAttendance(concertId, userId) {
        return httpInstance.delete(`${this.resourceEndpoint}/${concertId}/attend?userId=${userId}`);
    }

    /**
     * Deletes a category by its ID
     * @param {number|string} id - The ID of the category to delete
     * @returns {Promise<AxiosResponse<any>>} Promise that resolves when the category is deleted
     */

    async delete(id) {
        return await httpInstance.delete(`/concerts/${id}`);
    }

    /**
     * Retrieves categories by name
     * @param {string} name - The name to search for
     * @returns {Promise<AxiosResponse<any>>} Promise that resolves to an array of matching
     */
    getByName(name) {
        return httpInstance.get(`${this.resourceEndpoint}?name=${name}`);
    }
    /**
     * Retrieves categories by name
     * @param {platform} platform - The name to search for
     * @returns {Promise<AxiosResponse<any>>} Promise that resolves to an array of matching platforms
     */

    getByPlatform(platform) {
        return httpInstance.get(`/concerts/by-platform/${platform}`);
    }
}